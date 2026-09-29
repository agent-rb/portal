import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { EpisodeCatalog } from "@/components/podcast/catalog";
import { ShowNotes } from "@/components/podcast/show-notes";
import { PodcastSubscribe } from "@/components/podcast/subscribe";
import {
  catalogEpisodes,
  episodeSubscribeLinks,
  formatEpisodeDate,
  formatEpisodeNumber,
  getEpisode,
} from "@/lib/podcast";

interface EpisodePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return catalogEpisodes().map((episode) => ({ slug: episode.slug }));
}

export async function generateMetadata({ params }: EpisodePageProps): Promise<Metadata> {
  const { slug } = await params;
  const episode = getEpisode(slug);
  if (!episode) return {};
  return {
    title: episode.title,
    description: episode.summary,
  };
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  if (!siteConfig.features.podcast) notFound();

  const { slug } = await params;
  const episode = getEpisode(slug);
  if (!episode) notFound();

  const more = catalogEpisodes().filter((item) => item.slug !== episode.slug);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-24 pt-24 lg:px-8">
      <Link
        href="/podcast"
        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Catalog
      </Link>

      <div className="mt-8 max-w-3xl">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-wider">
          <span className="text-accent">Episode {formatEpisodeNumber(episode.number)}</span>
          <time dateTime={episode.date.slice(0, 10)} className="text-text-tertiary">
            {formatEpisodeDate(episode.date)}
          </time>
        </div>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">{episode.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-text-secondary">{episode.summary}</p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border/70 bg-black shadow-[0_0_80px_-28px_var(--glow)]">
        <iframe
          className="aspect-video w-full"
          src={`https://www.youtube-nocookie.com/embed/${episode.youtubeId}`}
          title={`${episode.title} video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      <div className="mt-10 max-w-3xl">
        {episode.notes ? (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">Show notes</h2>
            <div className="mt-4">
              <ShowNotes source={episode.notes} />
            </div>
          </section>
        ) : null}

        <section className={episode.notes ? "mt-10" : ""}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">Watch and subscribe</h2>
          <div className="mt-4">
            <PodcastSubscribe links={episodeSubscribeLinks(episode)} />
          </div>
        </section>

        {episode.transcript ? (
          <details className="group mt-10 rounded-2xl border border-border/70 bg-bg-elevated/30 px-5 py-4">
            <summary className="cursor-pointer text-sm font-semibold text-text-primary">Transcript</summary>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
              {episode.transcript}
            </div>
          </details>
        ) : null}
      </div>

      <EpisodeCatalog episodes={more} title="More episodes" />
    </main>
  );
}
