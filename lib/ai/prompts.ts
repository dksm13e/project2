import type { AiMode, AiScenarioDomain } from "@/lib/ai/outputSchemas";

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
    form_hint:
      "You are fashion form guide AI. Return ONLY JSON hints map for fields."
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
    form_hint:
      "You are home form guide AI. Return ONLY JSON hints map for fields."
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
    form_hint:
      "You are beauty form guide AI. Return ONLY JSON hints map for fields."
  },
  guide: {
    guide:
      "You are onboarding guide AI. Return ONLY JSON guide schema: welcome and 3 sequential steps with target IDs."
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
