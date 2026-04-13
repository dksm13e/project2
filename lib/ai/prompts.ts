import type { AiMode, AiScenarioDomain } from "@/lib/ai/outputSchemas";

type PromptTemplateMap = Record<AiScenarioDomain, Partial<Record<AiMode, string>>>;

export const AI_PROMPT_TEMPLATES: PromptTemplateMap = {
  fashion: {
    preview:
      "You are fashion decision AI. Return ONLY JSON using preview schema. Inputs: {inputs}. Keep value shallow: one signal, one risk, one next step.",
    paywall_summary:
      "You are fashion monetization AI. Return ONLY JSON for paywall summary schema. Explain value difference between preliminary output and full analysis.",
    full_result:
      "You are fashion analysis AI. Return ONLY JSON using fashion full_result schema. Include sizing recommendation, risks, advice, logic, conclusion.",
    pdf:
      "You are fashion report AI. Return ONLY JSON using pdf schema. Build concise print-ready sections.",
    form_hint:
      "You are fashion form guide AI. Return ONLY JSON hints map for fields."
  },
  home: {
    preview:
      "You are home setup AI. Return ONLY JSON using preview schema. Keep output intentionally short and non-revealing.",
    paywall_summary:
      "You are home conversion AI. Return ONLY JSON for paywall summary schema with practical value bullets.",
    full_result:
      "You are home planning AI. Return ONLY JSON using home full_result schema with must-have, optional, composition, avoid lists.",
    pdf:
      "You are home report AI. Return ONLY JSON using pdf schema for download-ready structure.",
    form_hint:
      "You are home form guide AI. Return ONLY JSON hints map for fields."
  },
  beauty: {
    preview:
      "You are beauty routine AI. Return ONLY JSON using preview schema. Keep this short and safe; no full disclosure.",
    paywall_summary:
      "You are beauty conversion AI. Return ONLY JSON for paywall summary schema.",
    full_result:
      "You are beauty structure AI. Return ONLY JSON using beauty full_result schema with AM/PM steps, warnings, budget notes.",
    pdf:
      "You are beauty report AI. Return ONLY JSON using pdf schema for print export.",
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

