"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { agentConfig } from "@/config/agents";
import { contentConfig } from "@/config/content";
import { BrandName } from "@/components/brand-name";

function burst(parent: HTMLDivElement, bubble: HTMLDivElement) {
  const parentBox = parent.getBoundingClientRect();
  const box = bubble.getBoundingClientRect();
  const style = getComputedStyle(bubble);
  const cx = box.left - parentBox.left + box.width / 2;
  const cy = box.top - parentBox.top + box.height / 2;
  const rimColor = style.getPropertyValue("--bubble-rim").trim();
  const coreColor = style.getPropertyValue("--bubble-core").trim();

  const splash = document.createElement("div");
  splash.className = "splash";
  splash.style.left = `${cx}px`;
  splash.style.top = `${cy}px`;
  splash.style.setProperty("--splash", rimColor);
  splash.style.setProperty("--splash-core", coreColor);
  splash.style.setProperty("--splash-size", `${Math.max(box.width * 0.3, 16)}px`);

  // Center flash
  const flash = document.createElement("span");
  flash.className = "splash-flash";
  flash.style.width = `${box.width * 0.6}px`;
  flash.style.height = `${box.width * 0.6}px`;
  splash.appendChild(flash);

  // Expanding rings — staggered for a ripple effect
  for (let i = 0; i < 4; i += 1) {
    const ring = document.createElement("span");
    ring.className = "splash-ring";
    ring.style.animationDelay = `${i * 0.08}s`;
    splash.appendChild(ring);
  }

  // Drops — varied sizes, gravity-biased
  const dropCount = 10 + Math.floor(box.width / 20);
  for (let i = 0; i < dropCount; i += 1) {
    const drop = document.createElement("span");
    drop.className = "splash-drop";
    const angle = (Math.PI * 2 * i) / dropCount + (Math.random() - 0.5) * 0.6;
    const distance = box.width * (0.3 + Math.random() * 0.7);
    const size = 3 + Math.random() * 5;
    drop.style.width = `${size}px`;
    drop.style.height = `${size}px`;
    drop.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`;
    drop.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    drop.style.setProperty("--dy", `${Math.sin(angle) * distance + distance * 0.35}px`);
    drop.style.animationDelay = `${Math.random() * 0.06}s`;
    splash.appendChild(drop);
  }

  // Currency symbols that fly out on pop
  const symbols = ["$", "£", "€", "¥", "₹", "₿"];
  const symbolCount = 6 + Math.floor(Math.random() * 4);
  for (let i = 0; i < symbolCount; i += 1) {
    const sym = document.createElement("span");
    sym.className = "splash-symbol";
    sym.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const angle = (Math.PI * 2 * i) / symbolCount + (Math.random() - 0.5) * 0.5;
    const distance = box.width * (0.8 + Math.random() * 1.2);
    sym.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    sym.style.setProperty("--dy", `${Math.sin(angle) * distance * 0.5 - distance * 0.4}px`);
    sym.style.setProperty("--rot", `${(Math.random() - 0.5) * 280}deg`);
    sym.style.fontSize = `${20 + Math.random() * 18}px`;
    sym.style.animationDelay = `${Math.random() * 0.08}s`;
    splash.appendChild(sym);
  }

  parent.appendChild(splash);
  window.setTimeout(() => splash.remove(), 1100);
}

function Bubbles() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let tone = 0;

    function spawn() {
      if (!el) return;
      const b = document.createElement("div");
      b.className = "bubble";
      b.dataset.tone = String(tone % 4);
      tone += 1;
      const large = Math.random() > 0.82;
      const s = large ? 140 + Math.random() * 70 : 36 + Math.random() * 72;
      Object.assign(b.style, {
        width: `${s}px`,
        height: `${s}px`,
        left: `${Math.random() * 100}%`,
        bottom: `-${s}px`,
        animationDuration: `${Math.random() * 12 + 16}s`,
        animationDelay: `${Math.random() * 6}s`,
      });
      const life = window.setTimeout(() => b.remove(), 30000);
      b.addEventListener("click", () => {
        window.clearTimeout(life);
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          b.remove();
          return;
        }
        burst(el, b);
        b.classList.add("bubble-popping");
        b.addEventListener("animationend", () => b.remove(), { once: true });
        window.setTimeout(() => b.remove(), 350);
      });
      el.appendChild(b);
    }

    for (let i = 0; i < 8; i++) spawn();
    const id = setInterval(spawn, 2400);
    return () => {
      clearInterval(id);
      el.replaceChildren();
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="absolute inset-0 z-[2] overflow-hidden" />;
}

function Instrument() {
  const ticks = Array.from({ length: 72 }, (_, index) => index);

  return (
    <div className="instrument" aria-hidden="true">
      <div className="hero-grid" />
      <svg className="instrument-svg" viewBox="0 0 200 200">
        <g className="instrument-spin">
          {ticks.map((index) => {
            const major = index % 6 === 0;
            return (
              <line
                key={index}
                x1="100"
                y1={major ? 3.5 : 6.5}
                x2="100"
                y2={major ? 11.5 : 9.2}
                stroke="var(--instrument-line)"
                strokeWidth={major ? 0.55 : 0.26}
                transform={`rotate(${index * 5} 100 100)`}
              />
            );
          })}
          <circle
            cx="100"
            cy="100"
            r="84"
            fill="none"
            stroke="var(--instrument-line)"
            strokeWidth="0.28"
            strokeDasharray="0.7 2.6"
          />
        </g>
        <g className="instrument-spin-reverse">
          <circle
            cx="100"
            cy="100"
            r="68"
            fill="none"
            stroke="var(--instrument-line)"
            strokeWidth="0.35"
            strokeDasharray="14 7"
          />
          <circle
            cx="100"
            cy="100"
            r="52"
            fill="none"
            stroke="var(--instrument-line)"
            strokeWidth="0.22"
          />
          <circle cx="168" cy="100" r="1.15" fill="var(--accent)" />
          <circle cx="32" cy="100" r="0.7" fill="var(--accent)" />
        </g>
        <g className="instrument-sweep">
          <circle
            cx="100"
            cy="100"
            r="78"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="28 462"
            opacity="0.85"
          />
        </g>
      </svg>
      <div className="scan-line" />
      <span className="hud-corner hud-tl" />
      <span className="hud-corner hud-tr" />
      <span className="hud-corner hud-bl" />
      <span className="hud-corner hud-br" />
    </div>
  );
}

export function Hero() {
  const { headline, subheadline, action } = contentConfig.hero;
  const exploreEnabled = agentConfig.visitorAssistant.enabled;
  const pill =
    "inline-flex items-center rounded-full border border-border/60 bg-bg-elevated/30 px-7 py-3.5 text-[15px] font-medium text-text-secondary backdrop-blur-md transition-colors hover:border-border hover:text-text-primary";

  return (
    <section className="relative flex h-dvh items-center justify-center overflow-hidden">
      <div className="hero-atmosphere absolute inset-0" />
      <Instrument />
      <Bubbles />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-8 text-center">
        <h1 className="animate-fade-in-up pb-[0.12em] text-6xl font-extrabold leading-[1.15] tracking-tight text-text-primary sm:text-7xl lg:text-8xl">
          <BrandName name={headline} />
        </h1>

        {/* Sub */}
        <p className="animate-fade-in-up-delay mt-8 max-w-xl text-lg leading-relaxed text-text-tertiary sm:text-xl">
          {subheadline}
        </p>

        {/* CTAs */}
        <div className="animate-fade-in-up-delay-2 mt-12 flex flex-wrap items-center justify-center gap-4">
          {exploreEnabled ? (
            <Link href="/explore" className={pill}>
              {action.label}
            </Link>
          ) : (
            <button type="button" disabled className={`${pill} cursor-not-allowed opacity-60 hover:border-border/60 hover:text-text-secondary`}>
              {action.message}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
