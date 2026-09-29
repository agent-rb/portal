import { getEpisodes, type Episode } from "@/lib/podcast";
import { getBlogPosts, type BlogPost } from "@/lib/blog";
import { siteConfig } from "@/config/site";

/* ── Types ──────────────────────────────────────────────── */

export interface ContentChunk {
  readonly id: string;
  readonly text: string;
  readonly source: ChunkSource;
  readonly vector?: readonly number[];
}

export interface ChunkSource {
  readonly type: "podcast" | "blog" | "site";
  readonly title: string;
  readonly slug: string;
  readonly url: string;
  readonly date?: string;
  readonly section?: string;
}

export interface RetrievalResult {
  readonly chunk: ContentChunk;
  readonly score: number;
}

/* ── Configuration ──────────────────────────────────────── */

const config = {
  /** Retrieval defaults (override per-call via topK parameter). */
  defaultTopK: 4,
  /** Maximum character length for a single transcript segment. */
  maxTranscriptSegment: 1500,
  /** Minimum segment length to include in the index. */
  minSegmentLength: 50,
  /** Minimum section length for header-split chunks. */
  minSectionLength: 20,
  /** In-memory cache TTL. Rebuilds the index after this period. */
  cacheTtlMs: 120_000,
  /** Vector dimension for the bag-of-words embedder. */
  vocabSize: 4096,
} as const;

/* ── In-memory index ────────────────────────────────────── */

let cachedIndex: ContentChunk[] | null = null;
let cachedAt = 0;

/* ── Public API ─────────────────────────────────────────── */

export function getIndex(): ContentChunk[] {
  const now = Date.now();
  if (cachedIndex && now - cachedAt < config.cacheTtlMs) return cachedIndex;

  const index = buildIndex();
  cachedIndex = index;
  cachedAt = now;
  return index;
}

export function retrieve(query: string, topK: number = config.defaultTopK): RetrievalResult[] {
  const index = getIndex();
  if (index.length === 0) return [];

  const queryVec = textToVector(query);
  const scored = index
    .filter((chunk) => chunk.vector)
    .map((chunk) => ({ chunk, score: cosineSimilarity(queryVec, chunk.vector!) }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}

export function indexStats(): { chunks: number; sources: Record<string, number> } {
  const index = getIndex();
  const sources: Record<string, number> = {};
  for (const chunk of index) {
    sources[chunk.source.type] = (sources[chunk.source.type] ?? 0) + 1;
  }
  return { chunks: index.length, sources };
}

/* ── Indexing ───────────────────────────────────────────── */

function buildIndex(): ContentChunk[] {
  const chunks: ContentChunk[] = [];

  for (const episode of getEpisodes()) {
    chunks.push(...chunkEpisode(episode));
  }

  for (const post of getBlogPosts()) {
    chunks.push(...chunkBlogPost(post));
  }

  chunks.push(...chunkSiteInfo());

  return chunks.map((chunk) => ({
    ...chunk,
    vector: textToVector(chunk.text),
  }));
}

function chunkEpisode(episode: Episode): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  const baseSource: ChunkSource = {
    type: "podcast",
    title: episode.title,
    slug: episode.slug,
    url: `/podcast/${episode.slug}`,
    date: episode.date,
  };

  if (episode.summary) {
    chunks.push({
      id: `podcast:${episode.slug}:summary`,
      text: `Podcast episode: ${episode.title}. ${episode.summary}`,
      source: { ...baseSource, section: "Summary" },
    });
  }

  if (episode.notes) {
    for (const section of splitByHeaders(episode.notes)) {
      chunks.push({
        id: `podcast:${episode.slug}:notes:${chunks.length}`,
        text: section,
        source: { ...baseSource, section: "Show notes" },
      });
    }
  }

  if (episode.transcript) {
    for (const segment of splitTranscript(episode.transcript)) {
      chunks.push({
        id: `podcast:${episode.slug}:transcript:${chunks.length}`,
        text: segment,
        source: { ...baseSource, section: "Transcript" },
      });
    }
  }

  return chunks;
}

function chunkBlogPost(post: BlogPost): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  const baseSource: ChunkSource = {
    type: "blog",
    title: post.title,
    slug: post.slug,
    url: `/blog/${post.slug}`,
    date: post.date,
  };

  chunks.push({
    id: `blog:${post.slug}:summary`,
    text: `Blog post: ${post.title}. ${post.summary}`,
    source: { ...baseSource, section: "Summary" },
  });

  for (const section of splitByHeaders(post.body)) {
    chunks.push({
      id: `blog:${post.slug}:body:${chunks.length}`,
      text: section,
      source: { ...baseSource, section: "Body" },
    });
  }

  return chunks;
}

function chunkSiteInfo(): ContentChunk[] {
  const { author } = siteConfig;
  const text = [
    `${siteConfig.name} is a site at ${siteConfig.url}.`,
    siteConfig.description,
    author.bio ? `About the author: ${author.name}. ${author.role}. ${author.bio}` : "",
  ].filter(Boolean).join(" ");

  return [{
    id: "site:about",
    text,
    source: {
      type: "site",
      title: siteConfig.name,
      slug: "",
      url: "/",
      section: "About",
    },
  }];
}

/* ── Chunking helpers ───────────────────────────────────── */

function splitByHeaders(markdown: string): string[] {
  const sections: string[] = [];
  let current = "";

  for (const line of markdown.split("\n")) {
    if (/^#{1,3}\s/.test(line) && current.trim()) {
      sections.push(current.trim());
      current = "";
    }
    current += line + "\n";
  }
  if (current.trim()) sections.push(current.trim());

  return sections.filter((s) => s.length > config.minSectionLength);
}

function splitTranscript(transcript: string): string[] {
  const segments: string[] = [];
  let current = "";

  for (const line of transcript.split("\n")) {
    const isSpeakerTurn = /^(Host|Guest|Speaker\s*\d*):/i.test(line.trim());
    if (isSpeakerTurn && current.length > 200) {
      segments.push(current.trim());
      current = "";
    }
    current += line + "\n";
    if (current.length > config.maxTranscriptSegment) {
      segments.push(current.trim());
      current = "";
    }
  }
  if (current.trim()) segments.push(current.trim());

  return segments.filter((s) => s.length > config.minSegmentLength);
}

/* ── Lightweight vector embeddings ──────────────────────── */
// Bag-of-words TF-IDF-like vectors for zero-cost local retrieval.
// To upgrade: replace textToVector() with a call to an embedding API
// (e.g. text-embedding-3-small). The rest of the retrieval pipeline
// stays the same — cosine similarity over fixed-dimension vectors.

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function hashToken(token: string): number {
  let h = 0;
  for (let i = 0; i < token.length; i++) {
    h = ((h << 5) - h + token.charCodeAt(i)) | 0;
  }
  return ((h % config.vocabSize) + config.vocabSize) % config.vocabSize;
}

function textToVector(text: string): number[] {
  const vec = new Float64Array(config.vocabSize);
  const tokens = tokenize(text);
  if (tokens.length === 0) return Array.from(vec);

  for (const token of tokens) {
    vec[hashToken(token)] += 1;
  }

  let max = 0;
  for (let i = 0; i < vec.length; i++) {
    if (vec[i] > max) max = vec[i];
  }
  if (max > 0) {
    for (let i = 0; i < vec.length; i++) {
      vec[i] /= max;
    }
  }

  for (let i = 0; i < tokens.length - 1; i++) {
    const bigram = tokens[i] + "_" + tokens[i + 1];
    vec[hashToken(bigram)] += 0.5;
  }

  return Array.from(vec);
}

function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  let dot = 0, magA = 0, magB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
  "her", "was", "one", "our", "out", "has", "have", "been", "this",
  "that", "with", "they", "from", "will", "what", "when", "make",
  "like", "just", "know", "take", "into", "your", "some", "than",
  "them", "very", "also", "about", "would", "there", "their", "which",
  "could", "other", "more", "then", "these", "does", "each",
]);
