import type { AiMode, AiScenarioDomain } from "@/lib/ai/schemas";

type PromptTemplateMap = Record<AiScenarioDomain, Partial<Record<AiMode, string>>>;

export const AI_PROMPT_TEMPLATES: PromptTemplateMap = {
  fashion: {
    preview:
      "You are fashion decision AI. Return ONLY JSON using preview schema. Inputs: {inputs}. Interpretation: {interpretation}. Keep value intentionally limited (about 20%).",
    paywall_summary:
      "You are fashion monetization AI. Return ONLY JSON for paywall summary schema. Use interpretation confidence and explain unlock value.",
    full_result:
      "You are fashion analysis AI. Return ONLY JSON using fashion full_result schema. Make recommendations data-dependent, include confidence and interpretation limits.",
    pdf:
      "You are fashion report AI. Return ONLY JSON using pdf schema with print-ready sections from the full analysis.",
    form_hint: "You are fashion form guide AI. Return ONLY JSON hints map for fields."
  },
  home: {
    preview:
      "You are home setup AI. Return ONLY JSON using preview schema. Keep output intentionally short and non-revealing. Inputs: {inputs}. Interpretation: {interpretation}.",
    paywall_summary:
      "You are home conversion AI. Return ONLY JSON for paywall summary schema with practical value bullets and confidence note.",
    full_result:
      "You are home planning AI. Return ONLY JSON using home full_result schema. Use room geometry, style and constraints.",
    pdf:
      "You are home report AI. Return ONLY JSON using pdf schema for download-ready structure derived from full result.",
    form_hint: "You are home form guide AI. Return ONLY JSON hints map for fields."
  },
  beauty: {
    preview:
      "You are beauty routine AI. Return ONLY JSON using preview schema. Keep this short and safe; no full disclosure. Inputs: {inputs}. Interpretation: {interpretation}.",
    paywall_summary:
      "You are beauty conversion AI. Return ONLY JSON for paywall summary schema with confidence and value unlock points.",
    full_result:
      "You are beauty structure AI. Return ONLY JSON using beauty full_result schema with AM/PM plan, conflict guards and sensitivity-safe rollout.",
    pdf:
      "You are beauty report AI. Return ONLY JSON using pdf schema for print export based on structured full analysis.",
    form_hint: "You are beauty form guide AI. Return ONLY JSON hints map for fields."
  },
  guide: {
    guide: "You are onboarding guide AI. Return ONLY JSON guide schema: welcome and 3 sequential steps with target IDs."
  }
};

export function getPromptTemplate(domain: AiScenarioDomain, mode: AiMode): string {
  const template = AI_PROMPT_TEMPLATES[domain][mode];
  if (!template) {
    throw new Error(`Missing AI prompt template for domain=${domain} mode=${mode}`);
  }
  return template;
}

export function materializePrompt(template: string, context: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => context[key] ?? "");
}

export function getLiveSystemPrompt(domain: AiScenarioDomain, mode: AiMode): string {
  return [
    "You are an AI reasoning layer inside a shopping decision product.",
    "Return only valid JSON object.",
    "Never include markdown fences, prose outside JSON, or comments.",
    "If images are attached, use them as supporting context and stay conservative when details are unclear.",
    "If input is weak, explicitly lower confidence and explain limitations.",
    `Domain=${domain}; Mode=${mode}.`
  ].join(" ");
}

export function getLiveUserPrompt(params: {
  domain: AiScenarioDomain;
  mode: AiMode;
  inputs: Record<string, string>;
  interpretation: unknown;
  baselineOutput: unknown;
}): string {
  return [
    "Generate a structured output that is specific to this user input.",
    "Do not return generic placeholders.",
    "Keep wording concise, avoid repetitions and long explanations.",
    "Use the baseline as fallback quality floor but improve specificity where possible.",
    `Domain: ${params.domain}`,
    `Mode: ${params.mode}`,
    `Inputs JSON: ${JSON.stringify(params.inputs)}`,
    `Interpretation JSON: ${JSON.stringify(params.interpretation)}`,
    `Baseline JSON: ${JSON.stringify(params.baselineOutput)}`
  ].join("\n");
}

export const HOME_STYLE_IMAGE_PROMPTS: Record<string, string> = {
  minimalism: "minimalist interior, neutral palette, soft daylight, uncluttered premium mood",
  "warm-minimal": "warm minimal interior, beige and wood tones, cozy premium calm lighting",
  scandi: "scandinavian interior, light wood, clean textiles, daylight calm mood",
  japandi: "japandi interior, natural wood, low visual noise, serene premium balance",
  "modern-clean": "modern clean interior, precise lines, minimal decor, premium neutral palette",
  "soft-loft": "soft loft interior, matte textures, gentle industrial accents, warm light",
  "modern-organic": "modern organic interior, biomorphic lines, natural textures, premium calm",
  "quiet-luxury-light": "quiet luxury light interior, subtle premium materials, soft warm lighting",
  "natural-neutral": "natural neutral interior, earthy tones, layered textures, elegant simplicity",
  "cozy-basic": "cozy basic interior, practical furniture, warm neutral palette",
  "storage-first": "storage-first interior, functional built-ins, neat and practical modern look",
  "compact-studio": "compact studio interior, efficient zoning, premium small-space optimization",
  "hotel-like-calm": "hotel-like calm interior, balanced lighting, refined soft textures",
  "soft-feminine": "soft feminine interior, rounded forms, gentle neutral rose-beige accents",
  "masculine-clean": "masculine clean interior, structured forms, muted deep neutrals",
  "family-practical": "family practical interior, durable materials, calm and organized layout",
  "rental-light": "rental-friendly interior, reversible decor choices, low-risk upgrades",
  "workspace-functional": "functional workspace interior, ergonomic layout, warm focused lighting",
  "dark-accent-modern": "modern interior with dark accents, balanced contrast, premium calm mood",
  "light-premium-simple": "light premium simple interior, airy palette, elegant minimal composition"
};

export function getOnboardingCharacterPrompt(state: "welcome" | "step1" | "step2" | "step3"): string {
  const poseByState: Record<typeof state, string> = {
    welcome: "standing calm welcome pose",
    step1: "soft pointing gesture",
    step2: "guide explanation gesture",
    step3: "gentle action cue gesture"
  };

  return [
    "Elegant assistant character, premium minimal lifestyle-tech style.",
    "Adult, calm, confident, not cartoonish, not childish.",
    "Soft warm neutral palette, subtle shading, transparent background.",
    `Pose: ${poseByState[state]}.`
  ].join(" ");
}

export function getFeatureIllustrationPrompt(kind: string): string {
  const map: Record<string, string> = {
    "fashion-preview": "minimal fashion fit-check workspace with garment silhouette, premium neutral tones",
    "home-preview": "clean interior planning board with room layout hints, warm premium tones",
    "beauty-preview": "organized skincare routine shelf with calm premium composition",
    "result-empty": "empty analysis dashboard state, subtle premium minimal visual",
    "open-by-code": "secure access code concept visual, calm product-like style",
    pricing: "clean pricing concept card stack, premium minimal look"
  };
  return map[kind] ?? "premium minimal product illustration with warm neutral tones";
}
