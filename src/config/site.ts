import type { SiteConfig } from "@/types/config";

export const siteConfig = {
  name: "AgentRB",
  domain: "agentrb.ai",
  url: "https://agentrb.ai",
  tagline: "Ask about AI agents.",
  description: "AI agents, podcast, and blog. Ask the chat anything about building and deploying agents.",
  author: {
    name: "Raghu Ram Banda",
    role: "AI Agent Builder",
    bio: "Building AI agents that turn static websites into interactive experiences. Hosting the AgentRB podcast where practitioners share how they deploy AI in the real world.",
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
