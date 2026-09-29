import { createOpenAI } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
  tool,
  zodSchema,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { agentConfig } from "@/config/agents";
import { contentConfig } from "@/config/content";
import { siteConfig } from "@/config/site";
import { allowRequest, clientAddress } from "@/lib/rate-limit";

/* ── Constants ──────────────────────────────────────────── */

export const maxDuration = 30;

const MAX_MESSAGES = 16;
const MAX_CHARS = 8_000;

/* ── Mode ───────────────────────────────────────────────── */
// "chat"  — Simple chat. Model + system prompt. No RAG, no tools.
//           The default for v1. Just a helpful chat about AI agents.
// "llm"   — Model + portal-provided RAG, tools, and system prompt.
//           Requires content in content/podcast and content/blog.
// "agent" — Thin proxy to an external agent harness. Portal only
//           validates, rate-limits, and streams.

const CHAT_MODE = (process.env.CHAT_MODE || "chat") as "chat" | "llm" | "agent";

/* ── Provider from env ──────────────────────────────────── */

const AGENT_BASE_URL = process.env.AGENT_BASE_URL || "https://text.pollinations.ai/v1";
const AGENT_API_KEY = process.env.AGENT_API_KEY || "anonymous";
const AGENT_MODEL = process.env.AGENT_MODEL || "openai";

const isPollinations = AGENT_BASE_URL.includes("pollinations.ai");

const provider = isPollinations
  ? createOpenAI({
      baseURL: AGENT_BASE_URL,
      apiKey: AGENT_API_KEY,
      fetch: async (_input, init) => {
        const response = await fetch(
          "https://text.pollinations.ai/openai",
          await pollinationsRequest(init),
        );
        return normalizePollinationsStream(response);
      },
    })
  : createOpenAI({
      baseURL: AGENT_BASE_URL,
      apiKey: AGENT_API_KEY,
    });

/* ── Route ──────────────────────────────────────────────── */

export async function POST(request: Request) {
  if (!agentConfig.visitorAssistant.enabled) {
    return text("The assistant is turned off.", 404);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return text("Send a message to continue.", 400);
  }

  const messages = visitorMessages(payload);
  if (!messages || messages.length === 0 || messages.at(-1)?.role !== "user") {
    return text("Send a message to continue.", 400);
  }

  const { maxRequests, windowMs } = agentConfig.visitorAssistant.rateLimit;
  if (!allowRequest(clientAddress(request), maxRequests, windowMs)) {
    return text("Too many messages just now. Wait a minute, then try again.", 429, {
      "Retry-After": String(Math.ceil(windowMs / 1000)),
    });
  }

  if (CHAT_MODE === "agent") return agentMode(messages);
  if (CHAT_MODE === "llm") return llmMode(messages);
  return chatMode(messages);
}

/* ── Chat mode (v1 default) ─────────────────────────────── */
// Simple chat. Model + system prompt. No RAG, no tools.

async function chatMode(messages: UIMessage[]) {
  const result = streamText({
    model: provider.chat(AGENT_MODEL),
    system: contentConfig.explore.instructions,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 1200,
    maxRetries: 0,
    timeout: 25_000,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: () => "The assistant could not reply. Try again.",
    }),
  });
}

/* ── Agent mode ─────────────────────────────────────────── */
// Thin proxy. The external agent owns RAG, tools, system prompt,
// and planning. The portal only validates, rate-limits, and streams.
// Always uses a clean provider -- never applies Pollinations hacks.

const agentProvider = createOpenAI({
  baseURL: AGENT_BASE_URL,
  apiKey: AGENT_API_KEY,
});

async function agentMode(messages: UIMessage[]) {
  const result = streamText({
    model: agentProvider.chat(AGENT_MODEL),
    messages: await convertToModelMessages(messages),
    maxRetries: 0,
    timeout: Number(process.env.AGENT_TIMEOUT_MS || 30_000),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: () => "The assistant could not reply. Try again.",
    }),
  });
}

/* ── LLM mode ───────────────────────────────────────────── */
// The portal provides its own RAG, tools, and system prompt.
// Used when pointing at a raw model (Pollinations, Groq, Ollama).

const LLM_CONFIG = {
  maxOutputTokens: 1200,
  streamTimeoutMs: 25_000,
  ragTopK: 4,
  searchTopK: 5,
  recommendCandidateK: 6,
  recommendLimit: 3,
  searchPreviewChars: 600,
  recommendPreviewChars: 300,
  contextPreviewChars: 800,
} as const;

let _knowledge: typeof import("@/lib/knowledge") | null = null;
let _store: typeof import("@/lib/store") | null = null;

async function getLlmDeps() {
  _knowledge ??= await import("@/lib/knowledge");
  _store ??= await import("@/lib/store");
  return { retrieve: _knowledge.retrieve, addSubscriber: _store.addSubscriber, saveQuestion: _store.saveQuestion };
}

async function llmMode(messages: UIMessage[]) {
  const { retrieve, addSubscriber, saveQuestion } = await getLlmDeps();

  const lastUserText = extractLastUserText(messages);
  const context = lastUserText ? retrieve(lastUserText, LLM_CONFIG.ragTopK) : [];

  const result = streamText({
    model: provider.chat(AGENT_MODEL),
    system: buildSystemPrompt(context),
    messages: await convertToModelMessages(messages),
    tools: buildTools(retrieve, addSubscriber, saveQuestion),
    stopWhen: stepCountIs(3),
    maxOutputTokens: LLM_CONFIG.maxOutputTokens,
    maxRetries: 0,
    timeout: LLM_CONFIG.streamTimeoutMs,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: () => "The assistant could not reply. Try again.",
    }),
  });
}

/* ── Tools (only used in LLM mode) ──────────────────────── */

type RetrieveFn = (query: string, topK?: number) => import("@/lib/knowledge").RetrievalResult[];
type SubscribeFn = typeof import("@/lib/store").addSubscriber;
type QuestionFn = typeof import("@/lib/store").saveQuestion;

function buildTools(retrieve: RetrieveFn, addSubscriber: SubscribeFn, saveQuestion: QuestionFn) {
  const siteName = siteConfig.name;

  return {
    search_content: tool({
      description: `Search ${siteName}'s podcast transcripts, blog posts, and docs for information relevant to the visitor's question.`,
      inputSchema: zodSchema(z.object({
        query: z.string().max(500).describe("The search query describing what to find"),
      })),
      execute: async ({ query }) => {
        const results = retrieve(query, LLM_CONFIG.searchTopK);
        if (results.length === 0) return { found: false, results: [] };
        return {
          found: true,
          results: results.map((r) => ({
            text: r.chunk.text.slice(0, LLM_CONFIG.searchPreviewChars),
            title: r.chunk.source.title,
            type: r.chunk.source.type,
            url: r.chunk.source.url,
            section: r.chunk.source.section,
            score: Math.round(r.score * 100),
          })),
        };
      },
    }),

    recommend_episodes: tool({
      description: `Recommend specific ${siteName} podcast episodes based on the visitor's interest or question.`,
      inputSchema: zodSchema(z.object({
        interest: z.string().describe("The visitor's interest or topic they want to learn about"),
      })),
      execute: async ({ interest }) => {
        const results = retrieve(interest, LLM_CONFIG.recommendCandidateK);
        const seen = new Set<string>();
        const episodes: Array<{ title: string; url: string; summary: string; relevance: string }> = [];

        for (const r of results) {
          if (r.chunk.source.type !== "podcast") continue;
          if (seen.has(r.chunk.source.slug)) continue;
          seen.add(r.chunk.source.slug);
          episodes.push({
            title: r.chunk.source.title,
            url: r.chunk.source.url,
            summary: r.chunk.text.slice(0, LLM_CONFIG.recommendPreviewChars),
            relevance: `Matched on: ${r.chunk.source.section}`,
          });
        }

        return { found: episodes.length > 0, episodes: episodes.slice(0, LLM_CONFIG.recommendLimit) };
      },
    }),

    subscribe_newsletter: tool({
      description: `Subscribe a visitor to the ${siteName} newsletter. Ask for their email first.`,
      inputSchema: zodSchema(z.object({
        email: z.string().email().describe("The visitor's email address"),
      })),
      execute: async ({ email }) => addSubscriber(email),
    }),

    collect_question: tool({
      description: "Save a visitor's question or feedback for the site owner to review later.",
      inputSchema: zodSchema(z.object({
        question: z.string().max(1000).describe("The visitor's question or feedback"),
        context: z.string().max(500).optional().describe("Optional context about what the visitor was asking about"),
      })),
      execute: async ({ question, context }) => saveQuestion(question, context),
    }),
  };
}

/* ── System prompt (only used in LLM mode) ──────────────── */

function buildSystemPrompt(context: import("@/lib/knowledge").RetrievalResult[]): string {
  const { author } = siteConfig;
  const siteName = siteConfig.name;
  const pages = siteConfig.nav.map((item) => `${item.label} (${item.href})`).join(", ");

  const sections = [
    contentConfig.explore.instructions,
    "",
    `Site: ${siteName} (${siteConfig.url}). ${siteConfig.description}`,
    author.name ? `Author: ${author.name}${author.role ? `, ${author.role}` : ""}. ${author.bio}` : "",
    `Pages: ${pages}.`,
    `Podcast: ${contentConfig.podcast.title}. ${contentConfig.podcast.description}`,
    "",
    `You have tools: search_content (search site content), recommend_episodes (suggest podcast episodes), subscribe_newsletter (subscribe visitors to the ${siteName} newsletter), collect_question (save unanswered questions).`,
    "",
    "When citing retrieved context, use markdown links: [Title](/path). If context is insufficient, use search_content to find more.",
  ];

  if (context.length > 0) {
    sections.push("", "## Retrieved context", "");
    for (const r of context) {
      sections.push(
        `[${r.chunk.source.title}](${r.chunk.source.url}) (${r.chunk.source.type}, ${r.chunk.source.section}):`,
      );
      sections.push(r.chunk.text.slice(0, LLM_CONFIG.contextPreviewChars));
      sections.push("");
    }
  }

  return sections.filter((s) => s !== undefined).join("\n");
}

/* ── Shared helpers ─────────────────────────────────────── */

function extractLastUserText(messages: UIMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role !== "user") continue;
    for (const part of messages[i].parts) {
      if (part.type === "text" && part.text.trim()) return part.text.trim();
    }
  }
  return null;
}

function visitorMessages(value: unknown): UIMessage[] | null {
  if (!value || typeof value !== "object" || !("messages" in value)) return null;
  const incoming = (value as { messages: unknown }).messages;
  if (!Array.isArray(incoming)) return null;

  const kept: UIMessage[] = [];
  for (const message of incoming.slice(-MAX_MESSAGES)) {
    if (!message || typeof message !== "object") continue;
    const role = (message as { role?: unknown }).role;
    const id = (message as { id?: unknown }).id;
    const parts = (message as { parts?: unknown }).parts;
    if ((role !== "user" && role !== "assistant") || typeof id !== "string" || !Array.isArray(parts)) {
      continue;
    }

    const textParts = parts.flatMap((part) => {
      if (!part || typeof part !== "object" || (part as { type?: unknown }).type !== "text") return [];
      const t = (part as { text?: unknown }).text;
      if (typeof t !== "string") return [];
      const trimmed = t.trim();
      if (!trimmed) return [];
      return [{ type: "text" as const, text: trimmed.slice(0, MAX_CHARS) }];
    });
    if (textParts.length === 0) continue;
    kept.push({ id, role, parts: textParts });
  }

  return kept;
}

/* ── Pollinations-specific helpers ──────────────────────── */

async function pollinationsRequest(init: RequestInit | undefined): Promise<RequestInit> {
  const headers = new Headers(init?.headers);
  headers.delete("authorization");
  headers.delete("content-length");

  let raw = "";
  if (typeof init?.body === "string") raw = init.body;
  else if (init?.body instanceof Uint8Array) raw = new TextDecoder().decode(init.body);

  if (!raw) return { method: init?.method ?? "POST", headers, signal: init?.signal };

  try {
    const json = JSON.parse(raw) as Record<string, unknown>;
    delete json.stream_options;
    delete json.reasoning_effort;
    return { method: init?.method ?? "POST", headers, body: JSON.stringify(json), signal: init?.signal };
  } catch {
    return { method: init?.method ?? "POST", headers, body: raw, signal: init?.signal };
  }
}

// Pollinations sends reasoning as `delta.reasoning` (non-standard).
// The AI SDK expects `delta.content`. This rewrites reasoning tokens
// into content so they stream to the UI. When actual content arrives,
// it passes through unchanged.
const SHOW_REASONING = process.env.SHOW_REASONING === "true";

function rewriteLine(line: string): string {
  if (!line.startsWith("data:")) return line;
  const data = line.slice(5).trim();
  if (!data || data === "[DONE]") return line;
  try {
    const json = JSON.parse(data) as {
      choices?: Array<{ delta?: Record<string, unknown> }>;
    };
    const delta = json.choices?.[0]?.delta;
    if (delta && "reasoning" in delta) {
      if (SHOW_REASONING && typeof delta.reasoning === "string" && delta.reasoning) {
        delta.content = delta.reasoning;
      }
      delete delta.reasoning;
    }
    return `data: ${JSON.stringify(json)}`;
  } catch {
    return line;
  }
}

function normalizePollinationsStream(response: Response): Response {
  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || !response.body || contentType.includes("application/json")) return response;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
      const lines = buffer.split(/\r?\n/);
      buffer = done ? "" : (lines.pop() ?? "");
      const kept = lines.map(rewriteLine);
      if (done && buffer) kept.push(rewriteLine(buffer));
      if (kept.length > 0) controller.enqueue(encoder.encode(`${kept.join("\n")}\n`));
      if (done) controller.close();
    },
  });

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(stream, { status: response.status, headers });
}

function text(message: string, status: number, headers?: HeadersInit) {
  return new Response(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", ...headers },
  });
}
