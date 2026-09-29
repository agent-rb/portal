import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { contentConfig } from "@/config/content";
import { siteConfig } from "@/config/site";
import { EpisodeCatalog, FeaturedEpisode, PodcastEmptyCatalog, PodcastHeader } from "@/components/podcast/catalog";
import { catalogEpisodes } from "@/lib/podcast";

export const metadata: Metadata = {
  title: contentConfig.podcast.title,
  description: contentConfig.podcast.description,
};

export default function PodcastPage() {
  if (!siteConfig.features.podcast) notFound();

  const episodes = catalogEpisodes();
  const [latest, ...rest] = episodes;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-24 pt-24 lg:px-8">
      <PodcastHeader />
      {latest ? (
        <>
          <FeaturedEpisode episode={latest} />
          <EpisodeCatalog episodes={rest} title="Earlier episodes" />
        </>
      ) : (
        <>
          <PodcastEmptyCatalog />
          <Link
            href="/"
            className="mt-8 inline-flex items-center rounded-full border border-border/60 bg-bg-elevated/30 px-4 py-2 text-sm font-medium text-text-secondary backdrop-blur-md transition-colors hover:border-border hover:text-text-primary"
          >
            Back to Home
          </Link>
        </>
      )}
    </main>
  );
}
