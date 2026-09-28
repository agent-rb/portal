import Link from "next/link";

export default function PodcastPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Podcast</h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-accent">Coming Soon</p>
          <p className="mt-4 leading-relaxed text-text-secondary">
            Conversations with practitioners building and deploying AI in the real world.
          </p>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-hover">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
            Back to Home
          </Link>
        </div>
    </div>
  );
}
