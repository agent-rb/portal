"use client";

import { useEffect, useRef, useState } from "react";
import { contentConfig } from "@/config/content";
import { BrandName } from "@/components/brand-name";

function burst(parent: HTMLDivElement, bubble: HTMLDivElement) {
  const parentBox = parent.getBoundingClientRect();
  const box = bubble.getBoundingClientRect();
  const style = getComputedStyle(bubble);
  const splash = document.createElement("div");
  splash.className = "splash";
  splash.style.left = `${box.left - parentBox.left + box.width / 2}px`;
  splash.style.top = `${box.top - parentBox.top + box.height / 2}px`;
  splash.style.setProperty("--splash", style.getPropertyValue("--bubble-rim").trim());
  splash.style.setProperty("--splash-size", `${Math.max(box.width * 0.22, 12)}px`);

  for (let i = 0; i < 3; i += 1) {
    const ring = document.createElement("span");
    ring.className = "splash-ring";
    ring.style.animationDelay = `${i * 0.07}s`;
    splash.appendChild(ring);
  }

  for (let i = 0; i < 8; i += 1) {
    const drop = document.createElement("span");
    drop.className = "splash-drop";
    const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.4;
    const distance = box.width * (0.35 + Math.random() * 0.45);
    drop.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    drop.style.setProperty("--dy", `${Math.sin(angle) * distance + distance * 0.25}px`);
    splash.appendChild(drop);
  }

  parent.appendChild(splash);
  window.setTimeout(() => splash.remove(), 800);
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
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          burst(el, b);
        }
        b.remove();
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
  const [held, setHeld] = useState(false);

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
          <button
            type="button"
            onClick={() => setHeld(true)}
            className="inline-flex items-center rounded-full border border-border/60 bg-bg-elevated/30 px-7 py-3.5 text-[15px] font-medium text-text-secondary backdrop-blur-md transition-colors hover:border-border hover:text-text-primary"
          >
            <span aria-live="polite">{held ? action.message : action.label}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
