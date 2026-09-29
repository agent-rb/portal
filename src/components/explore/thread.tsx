"use client";

import { Component, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import {
  ActionBarPrimitive,
  AssistantRuntimeProvider,
  AuiIf,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePartPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAui,
  useAuiState,
} from "@assistant-ui/react";
import { useChat } from "@ai-sdk/react";
import { AssistantChatTransport, useAISDKRuntime } from "@assistant-ui/ai-sdk";
import Link from "next/link";
import { contentConfig } from "@/config/content";
import { siteConfig } from "@/config/site";
import { BrandName } from "@/components/brand-name";
import { ChatMarkdown } from "@/components/explore/markdown";

export function ExploreThread() {
  return (
    <ChatErrorBoundary>
      <ExploreThreadInner />
    </ChatErrorBoundary>
  );
}

function ExploreThreadInner() {
  const [transport] = useState(() => new AssistantChatTransport({ api: "/api/chat" }));
  const chat = useChat({ transport });
  const runtime = useAISDKRuntime(chat);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  );
}

class ChatErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[chat] error boundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-lg font-semibold text-text-primary">Something went wrong</p>
          <p className="mt-2 text-sm text-text-secondary">The chat encountered an error.</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 rounded-full border border-border/70 px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-border hover:text-text-primary"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Thread() {
  return (
    <ThreadPrimitive.Root className="relative flex h-full min-h-0 flex-col">
      <ReplyAnnouncer />
      <ThreadPrimitive.Viewport
        turnAnchor="top"
        aria-label="Conversation"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 [scroll-behavior:auto] sm:px-6"
      >
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col py-8">
          <AuiIf condition={(state) => state.thread.messages.length === 0}>
            <EmptyState />
          </AuiIf>
          <ThreadPrimitive.Messages>
            {({ message }) => (message.role === "user" ? <UserMessage /> : <AssistantMessage />)}
          </ThreadPrimitive.Messages>
        </div>
      </ThreadPrimitive.Viewport>

      <div className="relative shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-bg-primary to-transparent" />
        <div className="relative mx-auto w-full max-w-3xl">
          <ThreadPrimitive.ScrollToBottom
            aria-label="Scroll to latest"
            className="absolute bottom-full right-0 mb-3 inline-flex h-8 items-center rounded-full border border-border/70 bg-bg-elevated px-3 text-xs font-medium text-text-secondary shadow-sm transition-opacity hover:text-text-primary disabled:pointer-events-none disabled:opacity-0"
          >
            Latest
          </ThreadPrimitive.ScrollToBottom>
          <Composer />
          <p className="px-2 pt-2 text-center text-[11px] leading-relaxed text-text-tertiary">
            Work in progress. This agent can make mistakes. Responses are AI‑generated, not professional advice.
            Nothing here creates a binding obligation. This conversation is not stored.
          </p>
        </div>
      </div>
    </ThreadPrimitive.Root>
  );
}

function EmptyState() {
  const { description, suggestions } = contentConfig.explore;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
      <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-text-tertiary transition-colors hover:text-text-primary">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Home
      </Link>
      <h1 className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl"><BrandName name={siteConfig.name} /></h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-text-tertiary sm:text-lg">{description}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {suggestions.map((suggestion) => (
          <ThreadPrimitive.Suggestion
            key={suggestion.prompt}
            prompt={suggestion.prompt}
            send
            className="rounded-full border border-border/60 bg-bg-elevated/30 px-4 py-2 text-sm text-text-secondary transition-colors hover:border-border hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {suggestion.label}
          </ThreadPrimitive.Suggestion>
        ))}
      </div>
    </div>
  );
}

function Composer() {
  return (
    <ComposerPrimitive.Root className="flex items-end gap-2 rounded-[1.75rem] border border-border/70 bg-bg-elevated/40 py-2 pl-5 pr-2 backdrop-blur-md focus-within:border-border">
      <ComposerPrimitive.Input
        id="explore-composer"
        aria-label="Message"
        autoFocus
        rows={1}
        maxRows={8}
        placeholder={contentConfig.explore.placeholder}
        submitMode="enter"
        unstable_focusOnRunStart={false}
        unstable_focusOnScrollToBottom={false}
        className="max-h-40 min-h-10 flex-1 resize-none bg-transparent py-2 text-[15px] leading-relaxed text-text-primary outline-none placeholder:text-text-tertiary"
      />
      <AuiIf condition={(state) => state.thread.isRunning}>
        <StopButton />
      </AuiIf>
      <AuiIf condition={(state) => !state.thread.isRunning}>
        <ComposerPrimitive.Send
          aria-label="Send message"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover disabled:bg-text-tertiary/35"
        >
          <ArrowUp />
        </ComposerPrimitive.Send>
      </AuiIf>
    </ComposerPrimitive.Root>
  );
}

function StopButton() {
  const aui = useAui();

  return (
    <button
      type="button"
      aria-label="Stop reply"
      onClick={() => aui.thread.cancelRun()}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-text-primary text-bg-primary"
    >
      <span className="h-2.5 w-2.5 rounded-[2px] bg-current" />
    </button>
  );
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="mb-6 flex justify-end">
      <div className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-lg border border-border/60 bg-bg-elevated px-4 py-2.5 text-[15px] leading-relaxed text-text-primary">
        <MessagePrimitive.Parts>
          {({ part }) => (part.type === "text" ? <UserText /> : null)}
        </MessagePrimitive.Parts>
      </div>
    </MessagePrimitive.Root>
  );
}

function UserText() {
  return <MessagePartPrimitive.Text />;
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="mb-8">
      <MessagePrimitive.Parts>
        {({ part }) => {
          if (part.type === "text") return <AssistantText />;
          if (part.type === "tool-call") return <ToolCallUI />;
          return null;
        }}
      </MessagePrimitive.Parts>
      <StallDetector />
      <MessagePrimitive.Error>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <ErrorPrimitive.Root className="text-sm text-text-secondary" role="alert">
            <ErrorPrimitive.Message />
          </ErrorPrimitive.Root>
          <ActionBarPrimitive.Reload className="rounded-full border border-border/70 px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:border-border hover:text-text-primary">
            Try again
          </ActionBarPrimitive.Reload>
        </div>
      </MessagePrimitive.Error>
    </MessagePrimitive.Root>
  );
}

function AssistantText() {
  const part = useAuiState((state) => (state.part.type === "text" ? state.part : null));
  if (!part) return null;
  const running = part.status?.type === "running";
  if (!part.text && running) return <Typing />;

  return (
    <div>
      <ChatMarkdown text={part.text} />
      {running ? <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-accent align-middle" /> : null}
    </div>
  );
}

function ToolCallUI() {
  const part = useAuiState((state) => (state.part.type === "tool-call" ? state.part : null));
  if (!part) return null;

  const isRunning = part.status?.type === "running";
  const result = part.result as Record<string, unknown> | undefined;

  if (isRunning) {
    return (
      <div className="my-2 flex items-center gap-2 rounded-xl border border-border/50 bg-bg-secondary/50 px-3 py-2 text-xs text-text-tertiary">
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          {toolLabel(part.toolName)}
        </span>
      </div>
    );
  }

  if (part.toolName === "search_content" && result) return <SearchResultsCard result={result} />;
  if (part.toolName === "recommend_episodes" && result) return <EpisodeRecommendations result={result} />;
  if (part.toolName === "subscribe_newsletter" && result) return <SubscribeConfirmation result={result} />;
  if (part.toolName === "collect_question" && result) return <QuestionSaved result={result} />;

  return null;
}

function toolLabel(name: string): string {
  const labels: Record<string, string> = {
    search_content: "Searching site content\u2026",
    recommend_episodes: "Finding relevant episodes\u2026",
    subscribe_newsletter: "Subscribing\u2026",
    collect_question: "Saving your question\u2026",
  };
  return labels[name] ?? "Working\u2026";
}

function SearchResultsCard({ result }: { result: Record<string, unknown> }) {
  const items = (result.results ?? []) as Array<{
    title: string; type: string; url: string; section?: string; score: number; text: string;
  }>;
  if (items.length === 0) return null;

  return (
    <div className="my-3 space-y-1.5">
      {items.slice(0, 3).map((item, i) => (
        <a
          key={i}
          href={item.url}
          className="flex items-start gap-2 rounded-xl border border-border/50 bg-bg-secondary/30 px-3 py-2 text-sm transition-colors hover:border-border hover:bg-bg-secondary/60"
        >
          <span className="mt-0.5 shrink-0 rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-accent">
            {item.type}
          </span>
          <span className="min-w-0">
            <span className="font-medium text-text-primary">{item.title}</span>
            {item.section ? <span className="ml-1 text-text-tertiary">({item.section})</span> : null}
          </span>
        </a>
      ))}
    </div>
  );
}

function EpisodeRecommendations({ result }: { result: Record<string, unknown> }) {
  const episodes = (result.episodes ?? []) as Array<{
    title: string; url: string; summary: string; relevance: string;
  }>;
  if (episodes.length === 0) return null;

  return (
    <div className="my-3 space-y-2">
      {episodes.map((ep, i) => (
        <a
          key={i}
          href={ep.url}
          className="block rounded-xl border border-border/50 bg-bg-secondary/30 px-4 py-3 transition-colors hover:border-border hover:bg-bg-secondary/60"
        >
          <div className="flex items-center gap-2">
            <span className="shrink-0 rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-accent">
              Episode
            </span>
            <span className="text-sm font-medium text-text-primary">{ep.title}</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary line-clamp-2">{ep.summary}</p>
        </a>
      ))}
    </div>
  );
}

function SubscribeConfirmation({ result }: { result: Record<string, unknown> }) {
  return (
    <div className="my-2 flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-text-primary">
      <CheckIcon />
      <span>{String(result.message ?? "Subscribed.")}</span>
    </div>
  );
}

function QuestionSaved({ result }: { result: Record<string, unknown> }) {
  return (
    <div className="my-2 flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-text-primary">
      <CheckIcon />
      <span>{String(result.message ?? "Question saved.")}</span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

const STALL_TIMEOUT_MS = 30_000;

function StallDetector() {
  const isRunning = useAuiState((state) => state.message.status?.type === "running");
  const hasContent = useAuiState((state) =>
    state.message.content?.some(
      (part: { type: string; text?: string }) => part.type === "text" && (part.text?.length ?? 0) > 0,
    ) ?? false,
  );
  const [stalled, setStalled] = useState(false);
  const aui = useAui();

  useEffect(() => {
    if (!isRunning || hasContent) {
      setStalled(false);
      return;
    }
    const timer = window.setTimeout(() => setStalled(true), STALL_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [isRunning, hasContent]);

  if (!stalled) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-bg-secondary/30 px-3 py-2 text-sm text-text-secondary">
      <span>The response is taking longer than expected.</span>
      <button
        type="button"
        onClick={() => aui.thread.cancelRun()}
        className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium transition-colors hover:border-border hover:text-text-primary"
      >
        Stop and try again
      </button>
    </div>
  );
}

function Typing() {
  return (
    <span className="inline-flex items-center gap-1 py-2" aria-hidden="true">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-tertiary" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-tertiary [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-tertiary [animation-delay:300ms]" />
    </span>
  );
}

function ReplyAnnouncer() {
  const running = useAuiState((state) => state.thread.isRunning);
  const wasRunning = useRef(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (wasRunning.current && !running) setMessage("Reply ready");
    wasRunning.current = running;
  }, [running]);

  return (
    <p className="sr-only" aria-live="polite">
      {message}
    </p>
  );
}

function ArrowUp() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}
