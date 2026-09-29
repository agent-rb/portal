import type { ContentConfig } from "@/types/config";

export const contentConfig = {
  hero: {
    headline: "AgentRB",
    subheadline: "Ask about AI agents.",
    action: { label: "Explore", message: "Stay tuned" },
  },
  podcast: {
    title: "Podcast",
    description:
      "Conversations with practitioners building and deploying AI in the real world.",
    subscribe: {
      youtube: "",
      spotify: "",
      apple: "",
      rss: "",
    },
  },
  explore: {
    title: "Explore",
    description: "This experience is a work in progress. Ask anything about building and deploying AI agents.",
    placeholder: "Ask AgentRB...",
    suggestions: [
      { label: "What are AI agents?", prompt: "What are AI agents and how are they different from chatbots?" },
      { label: "How do I start?", prompt: "I want to build my first AI agent. Where do I start?" },
      { label: "RAG explained", prompt: "What is RAG and why does it matter for agents?" },
      { label: "Open-source models", prompt: "Which open-source models are good for building agents?" },
    ],
    instructions: [
      "You are the AgentRB chat assistant. You help people learn about AI agents.",
      "",
      "Keep answers clear, practical, and concise. Use short paragraphs.",
      "If you do not know something, say so. Do not make things up.",
      "You are friendly and helpful, not salesy.",
    ].join("\n"),
  },
} as const satisfies ContentConfig;
