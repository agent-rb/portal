"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { portalNav } from "@/lib/navigation";
import { BrandName } from "@/components/brand-name";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function Navbar({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        solid || scrolled
          ? "border-b border-border bg-bg-primary/80 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="text-base font-bold tracking-tight text-text-primary transition-opacity hover:opacity-70"
        >
          <BrandName name={siteConfig.name} />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {portalNav().map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium text-text-tertiary transition-colors hover:text-text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {siteConfig.author.social.github && (
            <a
              href={siteConfig.author.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-[13px] font-medium text-text-tertiary transition-colors hover:text-text-primary md:inline"
            >
              GitHub
            </a>
          )}
          <ThemeToggle />
          <button
            className="text-text-primary md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
          {menuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-border bg-bg-primary/95 px-6 py-5 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4">
            {portalNav().map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-text-secondary"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {siteConfig.author.social.github && (
              <a
                href={siteConfig.author.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-text-secondary"
              >
                GitHub
              </a>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
