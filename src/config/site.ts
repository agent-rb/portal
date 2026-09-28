import type { SiteConfig } from "@/types/config";

export const siteConfig = {
  name: "AgentRB",
  domain: "agentrb.ai",
  url: "https://agentrb.ai",
  tagline: "What if they had agents?",
  description: "People have websites. What if they had agents?",
  author: {
    name: "AgentRB",
    role: "",
    bio: "",
    avatar: "/images/avatar.jpg",
    social: {
      github: "https://github.com/agentrb-ai",
      linkedin: "",
      twitter: "",
    },
  },
  nav: [
    { label: "Blog", href: "/blog" },
    { label: "Podcast", href: "/podcast" },
    { label: "Docs", href: "/docs" },
  ],
  features: {
    docs: true,
    blog: true,
    newsletter: true,
    podcast: true,
  },
} as const satisfies SiteConfig;
