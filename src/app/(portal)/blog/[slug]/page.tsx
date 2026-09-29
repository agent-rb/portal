import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getBlogPosts, formatPostDate } from "@/lib/blog";
import { ShowNotes } from "@/components/podcast/show-notes";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.summary };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-24 pt-24 lg:px-8">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Blog
      </Link>
      <div className="mt-8">
        <time dateTime={post.date.slice(0, 10)} className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          {formatPostDate(post.date)}
        </time>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-text-secondary">{post.summary}</p>
      </div>
      <div className="mt-10">
        <ShowNotes source={post.body} />
      </div>
    </main>
  );
}
