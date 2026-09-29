import Image from "next/image";
import Link from "next/link";
import { contentConfig } from "@/config/content";
import { PodcastSubscribe } from "@/components/podcast/subscribe";
import {
  formatEpisodeDate,
  formatEpisodeNumber,
  showSubscribeLinks,
  youtubeThumbnail,
  type CatalogEpisode,
} from "@/lib/podcast";

export function PodcastHeader() {
  return (
    <header className="max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
        {contentConfig.podcast.title}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">
        {contentConfig.podcast.description}
      </p>
      <div className="mt-6">
        <PodcastSubscribe links={showSubscribeLinks()} />
      </div>
    </header>
  );
}

export function PodcastEmptyCatalog() {
  return (
    <div className="mt-14 overflow-hidden rounded-2xl border border-border/70 bg-bg-elevated/30">
      <div className="flex aspect-video flex-col items-center justify-center px-6 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <MicIcon />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Coming Soon</p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-secondary">
          The first episode will play here.
        </p>
      </div>
    </div>
  );
}

export function FeaturedEpisode({ episode }: { episode: CatalogEpisode }) {
  return (
    <Link
      href={`/podcast/${episode.slug}`}
      className="group mt-14 block overflow-hidden rounded-2xl border border-border/70 bg-bg-elevated/30 transition-colors hover:border-border"
    >
      <Thumbnail youtubeId={episode.youtubeId} featured />
      <div className="relative z-10 flex flex-col gap-3 border-t border-border/60 bg-bg-primary p-5 sm:p-7">
        <EpisodeMeta episode={episode} latest />
        <h2 className="text-2xl font-semibold tracking-tight text-text-primary transition-colors group-hover:text-accent sm:text-3xl">
          {episode.title}
        </h2>
        <p className="max-w-2xl leading-relaxed text-text-secondary">{episode.summary}</p>
      </div>
    </Link>
  );
}

export function EpisodeCatalog({
  episodes,
  title = "Catalog",
}: {
  episodes: readonly CatalogEpisode[];
  title?: string;
}) {
  if (episodes.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">{title}</h2>
        <p className="text-sm text-text-tertiary">
          {episodes.length} {episodes.length === 1 ? "episode" : "episodes"}
        </p>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {episodes.map((episode) => (
          <li key={episode.slug}>
            <EpisodeRow episode={episode} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function EpisodeRow({ episode }: { episode: CatalogEpisode }) {
  return (
    <Link
      href={`/podcast/${episode.slug}`}
      className="group grid gap-4 rounded-2xl border border-transparent p-2 transition-colors hover:border-border/70 hover:bg-bg-elevated/30 sm:grid-cols-[220px_1fr] sm:items-center sm:p-3"
    >
      <Thumbnail youtubeId={episode.youtubeId} />
      <div>
        <EpisodeMeta episode={episode} />
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-text-primary transition-colors group-hover:text-accent">
          {episode.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-secondary">{episode.summary}</p>
      </div>
    </Link>
  );
}

function EpisodeMeta({ episode, latest = false }: { episode: CatalogEpisode; latest?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-wider">
      {latest ? <span className="text-accent">Latest</span> : null}
      <span className={latest ? "text-text-tertiary" : "text-accent"}>
        Episode {formatEpisodeNumber(episode.number)}
      </span>
      <time dateTime={episode.date.slice(0, 10)} className="text-text-tertiary">
        {formatEpisodeDate(episode.date)}
      </time>
    </div>
  );
}

function Thumbnail({ youtubeId, featured = false }: { youtubeId: string; featured?: boolean }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-bg-secondary">
      <Image
        src={youtubeThumbnail(youtubeId)}
        alt=""
        fill
        sizes={featured ? "(min-width: 64rem) 64rem, 100vw" : "(min-width: 640px) 220px, 100vw"}
        className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
      />
      <span className="absolute inset-0 bg-black/15 motion-safe:transition-colors motion-safe:group-hover:bg-black/25" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-md motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105">
          <PlayIcon />
        </span>
      </span>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg className="ml-0.5 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.16-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
      />
    </svg>
  );
}
