import type { ContentConfig } from "@/types/config";

export const contentConfig = {
  hero: {
    headline: "AgentRB",
    subheadline: "People have websites. What if they had agents?",
    action: { label: "Explore", message: "Stay tuned" },
  },
} as const satisfies ContentConfig;
