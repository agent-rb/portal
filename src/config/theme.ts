import type { ThemeConfig } from "@/types/config";

export const themeConfig = {
  colors: {
    light: {
      canvas: "#ffffff",
      canvasAlt: "#f5f5f7",
      ink: "#1d1d1f",
      body: "#424245",
      muted: "#86868b",
      accent: "#0071e3",
      border: "#d2d2d7",
    },
    dark: {
      canvas: "#000000",
      canvasAlt: "#111111",
      ink: "#f5f5f7",
      body: "#a1a1a6",
      muted: "#6e6e73",
      accent: "#2997ff",
      border: "#2a2a2d",
    },
  },
  fonts: {
    sans: "Inter",
    mono: "JetBrains Mono",
  },
  animation: {
    smoothScroll: true,
    sectionReveals: true,
    statCounters: true,
    horizontalCarousel: true,
  },
} as const;
