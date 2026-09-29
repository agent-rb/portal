"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const linkClass = "font-medium text-accent underline decoration-accent/30 underline-offset-2 hover:text-accent-hover hover:decoration-accent/60";

const components: Components = {
  a({ href, children }) {
    if (!href) return <span>{children}</span>;
    if (href.startsWith("/")) {
      return <Link href={href} className={linkClass}>{children}</Link>;
    }
    if (/^https?:\/\//i.test(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {children}
        </a>
      );
    }
    return <span>{children}</span>;
  },
  p({ children }) {
    return <p className="mb-3 last:mb-0">{children}</p>;
  },
  ul({ children }) {
    return <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>;
  },
  h2({ children }) {
    return <h2 className="mb-2 mt-4 text-lg font-semibold text-text-primary first:mt-0">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="mb-2 mt-3 text-base font-semibold text-text-primary first:mt-0">{children}</h3>;
  },
  blockquote({ children }) {
    return <blockquote className="mb-3 border-l border-border pl-3 text-text-tertiary last:mb-0">{children}</blockquote>;
  },
  code({ className, children }) {
    if (className) {
      return <code className={`${className} font-mono text-[0.92em]`}>{children}</code>;
    }
    return <code className="rounded bg-bg-secondary px-1 py-0.5 font-mono text-[0.92em] text-text-primary">{children}</code>;
  },
  pre({ children }) {
    return <CodeBlock>{children}</CodeBlock>;
  },
  table({ children }) {
    return (
      <div className="mb-3 overflow-x-auto last:mb-0">
        <table className="w-full border-collapse text-left text-sm">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return <th className="border-b border-border px-2 py-1 font-medium text-text-primary">{children}</th>;
  },
  td({ children }) {
    return <td className="border-b border-border/60 px-2 py-1">{children}</td>;
  },
};

export function ChatMarkdown({ text }: { text: string }) {
  return (
    <div className="text-[15px] leading-relaxed text-text-secondary">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="group relative my-3 last:mb-0">
      <button
        type="button"
        className="absolute right-2 top-2 rounded-full border border-border/70 bg-bg-primary/80 px-2.5 py-1 text-[11px] font-medium text-text-tertiary opacity-0 transition-opacity hover:text-text-primary focus-visible:opacity-100 group-hover:opacity-100"
        onClick={(event) => {
          const block = event.currentTarget.parentElement?.querySelector("pre");
          const value = block?.innerText ?? "";
          void navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1400);
          });
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="overflow-x-auto rounded-2xl border border-border/70 bg-bg-secondary px-4 py-3 font-mono text-[13px] leading-relaxed text-text-primary">
        {children}
      </pre>
    </div>
  );
}
