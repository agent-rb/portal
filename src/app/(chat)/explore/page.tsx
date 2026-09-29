import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { agentConfig } from "@/config/agents";
import { contentConfig } from "@/config/content";
import { ExploreThread } from "@/components/explore/thread";

export const metadata: Metadata = {
  title: contentConfig.explore.title,
  description: contentConfig.explore.description,
};

export default function ExplorePage() {
  if (!agentConfig.visitorAssistant.enabled) notFound();

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <ExploreThread />
    </main>
  );
}
