import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {item.label}
            </Link>
          ))}
          {siteConfig.author.social.github && (
            <a
              href={siteConfig.author.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              GitHub
            </a>
          )}
          <a
            href={`mailto:hello@${siteConfig.domain}`}
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Email
          </a>
        </nav>
        <p className="text-xs text-text-tertiary">
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
