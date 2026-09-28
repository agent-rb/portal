import type { AgentConfig } from "@/types/config";

export const agentConfig = {
  defaultModel: "openai/gpt-4o-mini",
  premiumModel: "openai/gpt-4o",
  embeddingModel: "openai/text-embedding-3-small",
  costBudgetPerMonth: 5,

  contentDraft: {
    enabled: true,
    model: "openai/gpt-4o",
    maxSteps: 10,
    requireApproval: true,
  },
  podcastRepurpose: {
    enabled: true,
    transcriptionProvider: "whisper",
    model: "openai/gpt-4o-mini",
  },
  seoMetadata: {
    enabled: true,
    model: "openai/gpt-4o-mini",
  },
  newsletterCompose: {
    enabled: true,
    model: "openai/gpt-4o-mini",
  },
  visitorAssistant: {
    enabled: true,
    model: "openai/gpt-4o-mini",
    rateLimit: { maxRequests: 20, windowMs: 60_000 },
  },
} as const satisfies AgentConfig;
