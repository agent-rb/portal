/* ── Config type definitions ─────────────────────────────── */

export interface SiteConfig {
  readonly name: string;
  readonly domain: string;
  readonly url: string;
  readonly tagline: string;
  readonly description: string;
  readonly author: {
    readonly name: string;
    readonly role: string;
    readonly bio: string;
    readonly avatar: string;
    readonly social: {
      readonly github?: string;
      readonly linkedin?: string;
      readonly twitter?: string;
      readonly youtube?: string;
    };
  };
  readonly nav: ReadonlyArray<{
    readonly label: string;
    readonly href: string;
  }>;
  readonly features: {
    readonly docs: boolean;
    readonly blog: boolean;
    readonly newsletter: boolean;
    readonly podcast: boolean;
  };
}

export interface ColorPalette {
  readonly canvas: string;
  readonly canvasAlt: string;
  readonly ink: string;
  readonly body: string;
  readonly muted: string;
  readonly accent: string;
  readonly border: string;
}

export interface ThemeConfig {
  readonly colors: {
    readonly light: ColorPalette;
    readonly dark: ColorPalette;
  };
  readonly fonts: {
    readonly sans: string;
    readonly mono: string;
  };
  readonly animation: {
    readonly smoothScroll: boolean;
    readonly sectionReveals: boolean;
    readonly particles: boolean;
  };
}

export interface ContentConfig {
  readonly hero: {
    readonly headline: string;
    readonly subheadline: string;
    readonly action: {
      readonly label: string;
      readonly message: string;
    };
  };
}

export interface AgentConfig {
  readonly defaultModel: string;
  readonly premiumModel: string;
  readonly embeddingModel: string;
  readonly costBudgetPerMonth: number;
  readonly contentDraft: {
    readonly enabled: boolean;
    readonly model: string;
    readonly maxSteps: number;
    readonly requireApproval: boolean;
  };
  readonly podcastRepurpose: {
    readonly enabled: boolean;
    readonly transcriptionProvider: string;
    readonly model: string;
  };
  readonly seoMetadata: {
    readonly enabled: boolean;
    readonly model: string;
  };
  readonly newsletterCompose: {
    readonly enabled: boolean;
    readonly model: string;
  };
  readonly visitorAssistant: {
    readonly enabled: boolean;
    readonly model: string;
    readonly rateLimit: {
      readonly maxRequests: number;
      readonly windowMs: number;
    };
  };
}
