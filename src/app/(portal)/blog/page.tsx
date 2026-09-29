import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts, formatPostDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Technical articles on AI agents, infrastructure, and building intelligent web experiences.",
};

export default function BlogPage() {
  const posts = getBlogPosts();

  if (posts.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Blog</h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-accent">Coming Soon</p>
          <p className="mt-4 leading-relaxed text-text-secondary">
            Technical articles on AI agents, infrastructure, and enterprise AI strategy.
          </p>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-hover">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-24 pt-24 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">Blog</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">
        Technical articles on AI agents, infrastructure, and building intelligent web experiences.
      </p>
      <ul className="mt-12 flex flex-col gap-10">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="group block">
              <time dateTime={post.date.slice(0, 10)} className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                {formatPostDate(post.date)}
              </time>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary transition-colors group-hover:text-accent">
                {post.title}
              </h2>
              <p className="mt-2 leading-relaxed text-text-secondary">{post.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
