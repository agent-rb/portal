import fs from "node:fs";
import path from "node:path";
import { contentConfig } from "@/config/content";

const DIRECTORY = path.join(process.cwd(), "content", "podcast");
const EPISODE_FILE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const TRANSCRIPT_FILE = /^(?:[\w.-]+\/)*[\w.-]+\.(?:vtt|txt)$/;

export interface Episode {
  readonly slug: string;
  readonly title: string;
  readonly date: string;
  readonly summary: string;
  readonly youtubeId: string;
  readonly spotifyEpisodeId: string;
  readonly notes: string;
  readonly transcript?: string;
}

export interface CatalogEpisode extends Episode {
  readonly number: number;
}

export function getEpisodes(): Episode[] {
  if (!fs.existsSync(DIRECTORY)) return [];

  return fs
    .readdirSync(DIRECTORY)
    .filter((file) => EPISODE_FILE.test(file))
    .map((file) => readEpisode(file))
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function getEpisode(slug: string): CatalogEpisode | undefined {
  return catalogEpisodes().find((episode) => episode.slug === slug);
}

export function catalogEpisodes(): CatalogEpisode[] {
  const episodes = getEpisodes();
  const chronological = [...episodes].sort(
    (a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug),
  );
  const numbers = new Map(chronological.map((episode, index) => [episode.slug, index + 1]));
  return episodes.map((episode) => ({ ...episode, number: numbers.get(episode.slug) ?? 0 }));
}

export function formatEpisodeNumber(number: number): string {
  return String(number).padStart(2, "0");
}

export function youtubeThumbnail(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

export function youtubeWatchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

export function spotifyEpisodeUrl(spotifyEpisodeId: string): string {
  return `https://open.spotify.com/episode/${spotifyEpisodeId}`;
}

export function showSubscribeLinks() {
  const { subscribe } = contentConfig.podcast;
  return [
    { label: "YouTube", href: subscribe.youtube },
    { label: "Spotify", href: subscribe.spotify },
    { label: "Apple Podcasts", href: subscribe.apple },
    { label: "RSS", href: subscribe.rss },
  ];
}

export function episodeSubscribeLinks(episode: Episode) {
  const { subscribe } = contentConfig.podcast;
  return [
    { label: "YouTube", href: youtubeWatchUrl(episode.youtubeId) },
    { label: "Spotify", href: spotifyEpisodeUrl(episode.spotifyEpisodeId) },
    { label: "Apple Podcasts", href: subscribe.apple },
    { label: "RSS", href: subscribe.rss },
  ];
}

export function formatEpisodeDate(isoDate: string): string {
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

function readEpisode(file: string): Episode {
  const raw = fs.readFileSync(path.join(DIRECTORY, file), "utf8").replace(/\r\n/g, "\n");
  const { data, body } = parseFrontmatter(raw, file);
  const slug = file.slice(0, -3);
  const declaredSlug = required(data, "slug", file);
  if (declaredSlug !== slug) {
    fail(file, `slug "${declaredSlug}" must match the filename`);
  }

  const date = required(data, "date", file);
  if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(date) || Number.isNaN(Date.parse(date))) {
    fail(file, "date must be an ISO date");
  }

  return {
    slug,
    title: required(data, "title", file),
    date,
    summary: required(data, "summary", file),
    youtubeId: youtubeId(required(data, "youtubeId", file), file),
    spotifyEpisodeId: spotifyEpisodeId(required(data, "spotifyEpisodeId", file), file),
    notes: body,
    transcript: resolveTranscript(data.transcript, file),
  };
}

function parseFrontmatter(raw: string, file: string): { data: Record<string, string>; body: string } {
  if (!raw.startsWith("---\n")) fail(file, "starts without frontmatter");
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) fail(file, "frontmatter is not closed");

  const data: Record<string, string> = {};
  const lines = raw.slice(4, end).split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (line.trim() === "") {
      index += 1;
      continue;
    }

    const match = /^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/.exec(line);
    if (!match) fail(file, `cannot read frontmatter line "${line}"`);

    const key = match[1];
    const value = match[2];
    if (value === "|" || value === ">") {
      const block: string[] = [];
      index += 1;
      while (index < lines.length && (lines[index].startsWith("  ") || lines[index].trim() === "")) {
        block.push(lines[index].startsWith("  ") ? lines[index].slice(2) : "");
        index += 1;
      }
      data[key] = block.join("\n").trim();
      continue;
    }

    data[key] = unquote(value.trim());
    index += 1;
  }

  return { data, body: raw.slice(end + 5).trim() };
}

function resolveTranscript(value: string | undefined, file: string): string | undefined {
  if (!value) return undefined;
  if (value.includes("\n") || !TRANSCRIPT_FILE.test(value)) return value;

  const root = path.resolve(DIRECTORY);
  const resolved = path.resolve(root, value);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    fail(file, "transcript path leaves content/podcast");
  }
  if (!fs.existsSync(resolved)) fail(file, `transcript file not found: ${value}`);
  return fs.readFileSync(resolved, "utf8").trim();
}

function required(data: Record<string, string>, key: string, file: string): string {
  const value = data[key]?.trim();
  if (!value) fail(file, `missing ${key}`);
  return value;
}

function youtubeId(value: string, file: string): string {
  const fromUrl = /(?:youtu\.be\/|embed\/|v=)([a-zA-Z0-9_-]{11})/.exec(value);
  const id = fromUrl?.[1] ?? value.trim();
  if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) fail(file, "youtubeId must be an 11-character video id");
  return id;
}

function spotifyEpisodeId(value: string, file: string): string {
  const fromUrl = /episode\/([A-Za-z0-9]+)/.exec(value);
  const id = fromUrl?.[1] ?? value.trim();
  if (!/^[A-Za-z0-9]{10,}$/.test(id)) fail(file, "spotifyEpisodeId must be a Spotify episode id");
  return id;
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
  throw new Error(`content/podcast/${file}: ${message}`);
}
