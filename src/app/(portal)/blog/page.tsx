import Link from "next/link";

export default function BlogPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Blog</h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-accent">Coming Soon</p>
          <p className="mt-4 leading-relaxed text-text-secondary">
            Technical articles on AI agents, infrastructure, MLOps, and enterprise AI strategy.
          </p>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-hover">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
            Back to Home
          </Link>
        </div>
    </div>
  );
}
