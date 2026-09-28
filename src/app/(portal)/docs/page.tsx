import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Documentation</h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-accent">Coming Soon</p>
          <p className="mt-4 leading-relaxed text-text-secondary">
            Architecture guides, technical references, and hands-on walkthroughs.
          </p>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-hover">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
            Back to Home
          </Link>
        </div>
    </div>
  );
}
