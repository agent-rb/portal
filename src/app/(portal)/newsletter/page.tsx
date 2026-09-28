import Link from "next/link";

export default function NewsletterPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Newsletter</h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-accent">Coming Soon</p>
        <p className="mt-4 leading-relaxed text-text-secondary">
          A short note from AgentRB, when there is something worth sending.
        </p>
        <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-hover">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
