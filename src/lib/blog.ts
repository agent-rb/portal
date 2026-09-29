import fs from "node:fs";
import path from "node:path";

const DIRECTORY = path.join(process.cwd(), "content", "blog");
const POST_FILE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

export interface BlogPost {
  readonly slug: string;
  readonly title: string;
  readonly date: string;
  readonly summary: string;
  readonly body: string;
}

export function getBlogPosts(): BlogPost[] {
  if (!fs.existsSync(DIRECTORY)) return [];

  return fs
    .readdirSync(DIRECTORY)
    .filter((file) => POST_FILE.test(file))
    .map((file) => readPost(file))
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return getBlogPosts().find((post) => post.slug === slug);
}

export function formatPostDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) return isoDate;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function readPost(file: string): BlogPost {
  const raw = fs.readFileSync(path.join(DIRECTORY, file), "utf8").replace(/\r\n/g, "\n");
  const { data, body } = parseFrontmatter(raw, file);
  const slug = file.slice(0, -3);
  const declaredSlug = required(data, "slug", file);
  if (declaredSlug !== slug) fail(file, `slug "${declaredSlug}" must match the filename`);

  const date = required(data, "date", file);
  if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(date) || Number.isNaN(Date.parse(date))) {
    fail(file, "date must be an ISO date");
  }

  return {
    slug,
    title: required(data, "title", file),
    date,
    summary: required(data, "summary", file),
    body,
  };
}

function parseFrontmatter(raw: string, file: string): { data: Record<string, string>; body: string } {
  if (!raw.startsWith("---\n")) fail(file, "starts without frontmatter");
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) fail(file, "frontmatter is not closed");

  const data: Record<string, string> = {};
  for (const line of raw.slice(4, end).split("\n")) {
    if (!line.trim()) continue;
    const match = /^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/.exec(line);
    if (!match) fail(file, `cannot read frontmatter line "${line}"`);
    data[match[1]] = unquote(match[2].trim());
  }

  return { data, body: raw.slice(end + 5).trim() };
}

function required(data: Record<string, string>, key: string, file: string): string {
  const value = data[key]?.trim();
  if (!value) fail(file, `missing ${key}`);
  return value;
}

function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function fail(file: string, message: string): never {
  throw new Error(`content/blog/${file}: ${message}`);
}
