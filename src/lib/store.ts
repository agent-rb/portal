import fs from "node:fs";
import path from "node:path";

/**
 * Portable key-value store that works across deployment targets.
 *
 * - Vercel / serverless: uses webhook URLs for subscribers and questions
 *   (set SUBSCRIBE_WEBHOOK_URL and QUESTION_WEBHOOK_URL in env).
 * - Container / npm: falls back to the local filesystem under DATA_DIR.
 * - The store never crashes the request. Write failures are logged, not thrown.
 */

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const SUBSCRIBE_WEBHOOK_URL = process.env.SUBSCRIBE_WEBHOOK_URL;
const SUBSCRIBE_WEBHOOK_SECRET = process.env.SUBSCRIBE_WEBHOOK_SECRET;
const QUESTION_WEBHOOK_URL = process.env.QUESTION_WEBHOOK_URL;
const QUESTION_WEBHOOK_SECRET = process.env.QUESTION_WEBHOOK_SECRET;

/* ── Subscribers ────────────────────────────────────────── */

export async function addSubscriber(email: string): Promise<{ success: boolean; message: string }> {
  if (SUBSCRIBE_WEBHOOK_URL) {
    return postWebhook(SUBSCRIBE_WEBHOOK_URL, { email, source: "agent" }, SUBSCRIBE_WEBHOOK_SECRET);
  }
  return addToLocalList("subscribers.json", email);
}

export function getSubscribers(): string[] {
  return readLocalList("subscribers.json");
}

/* ── Visitor questions ──────────────────────────────────── */

export interface VisitorQuestion {
  question: string;
  context?: string;
  time: string;
}

export async function saveQuestion(
  question: string,
  context?: string,
): Promise<{ saved: boolean; message: string }> {
  const entry: VisitorQuestion = { question, context, time: new Date().toISOString() };

  if (QUESTION_WEBHOOK_URL) {
    const result = await postWebhook(QUESTION_WEBHOOK_URL, entry as unknown as Record<string, unknown>, QUESTION_WEBHOOK_SECRET);
    return { saved: result.success, message: result.message };
  }
  return appendToLocalLog("visitor-questions.json", entry as unknown as Record<string, unknown>);
}

/* ── Webhook transport ──────────────────────────────────── */

async function postWebhook(
  url: string,
  payload: Record<string, unknown>,
  secret?: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (secret) headers["Authorization"] = `Bearer ${secret}`;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) {
      console.error(`[store] webhook ${url} returned ${response.status}`);
      return { success: false, message: "Could not complete the request right now." };
    }
    return { success: true, message: "Done." };
  } catch (error) {
    console.error("[store] webhook failed:", error);
    return { success: false, message: "Could not complete the request right now." };
  }
}

/* ── Local filesystem transport ─────────────────────────── */

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Read-only filesystem (e.g. Vercel serverless). Writes will fail gracefully.
    }
  }
}

function localPath(file: string): string {
  return path.join(DATA_DIR, file);
}

function addToLocalList(file: string, value: string): { success: boolean; message: string } {
  ensureDir();
  const filePath = localPath(file);
  try {
    let items: string[] = [];
    try {
      items = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch { /* first entry */ }

    if (items.includes(value)) {
      return { success: true, message: "Already subscribed." };
    }

    items.push(value);
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
    return { success: true, message: "Subscribed." };
  } catch (error) {
    console.error("[store] local write failed:", error);
    return { success: false, message: "Could not save right now. Try again later." };
  }
}

function readLocalList(file: string): string[] {
  try {
    return JSON.parse(fs.readFileSync(localPath(file), "utf8"));
  } catch {
    return [];
  }
}

function appendToLocalLog(
  file: string,
  entry: Record<string, unknown>,
): { saved: boolean; message: string } {
  ensureDir();
  const filePath = localPath(file);
  try {
    let entries: Record<string, unknown>[] = [];
    try {
      entries = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch { /* first entry */ }

    entries.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(entries, null, 2));
    return { saved: true, message: "Your question has been saved." };
  } catch (error) {
    console.error("[store] local write failed:", error);
    return { saved: false, message: "Could not save right now. Try again later." };
  }
}
