import type { ScenarioId } from "@/lib/scenarios";

export type AiScenarioDomain = "fashion" | "home" | "beauty" | "guide";
export type AiScenarioKey = ScenarioId | "guide";

export type AiMode =
  | "preview"
  | "paywall_summary"
  | "full_result"
  | "pdf"
  | "form_hint"
  | "guide";

export const AI_OUTPUT_SCHEMAS = {
  fashion: {
    preview: "fashion.preview.v1",
    paywall_summary: "fashion.paywall_summary.v1",
    full_result: "fashion.full_result.v1",
    pdf: "fashion.pdf.v1",
    form_hint: "fashion.form_hint.v1"
  },
  home: {
    preview: "home.preview.v1",
    paywall_summary: "home.paywall_summary.v1",
    full_result: "home.full_result.v1",
    pdf: "home.pdf.v1",
    form_hint: "home.form_hint.v1"
  },
  beauty: {
    preview: "beauty.preview.v1",
    paywall_summary: "beauty.paywall_summary.v1",
    full_result: "beauty.full_result.v1",
    pdf: "beauty.pdf.v1",
    form_hint: "beauty.form_hint.v1"
  },
  guide: {
    guide: "guide.onboarding.v1"
  }
} as const;

export type AiOutputSchemaId =
  | (typeof AI_OUTPUT_SCHEMAS.fashion)[keyof typeof AI_OUTPUT_SCHEMAS.fashion]
  | (typeof AI_OUTPUT_SCHEMAS.home)[keyof typeof AI_OUTPUT_SCHEMAS.home]
  | (typeof AI_OUTPUT_SCHEMAS.beauty)[keyof typeof AI_OUTPUT_SCHEMAS.beauty]
  | (typeof AI_OUTPUT_SCHEMAS.guide)[keyof typeof AI_OUTPUT_SCHEMAS.guide];

export type PreviewModeOutput = {
  key_insight: string;
  main_risk: string;
  next_step: string;
  preview_summary: string;
};

export type PaywallSummaryOutput = {
  product_name: string;
  short_summary: string;
  value_bullets: string[];
  unlock_outcome: string;
};

export type FashionFullResultOutput = {
  main_size: string;
  alt_size: string;
  fit_summary: string;
  risk_level: "low" | "medium" | "high";
  risks: string[];
  advice: string[];
  short_conclusion: string;
  logic_explanation: string;
  important_considerations: string[];
};

export type HomeFullResultOutput = {
  set_type: string;
  budget_vector: string;
  must_have: string[];
  optional: string[];
  composition_notes: string[];
  avoid: string[];
  short_conclusion: string;
  logic_explanation: string;
  important_considerations: string[];
};

export type BeautyFullResultOutput = {
  routine_type: string;
  main_focus: string;
  am_steps: string[];
  pm_steps: string[];
  optional_steps: string[];
  warnings: string[];
  budget_notes: string[];
  short_conclusion: string;
  logic_explanation: string;
  important_considerations: string[];
};

export type PdfModeOutput = {
  title: string;
  summary: string;
  sections: Array<{ title: string; items: string[] }>;
  recommendations: string[];
  notes: string[];
  disclaimer: string;
};

export type FormHintsOutput = {
  hints: Record<string, string>;
};

export type GuideStepOutput = {
  id: number;
  target_id: string;
  title: string;
  text: string;
  next_label: string;
};

export type GuideOutput = {
  welcome_title: string;
  welcome_text: string;
  start_label: string;
  skip_label: string;
  steps: GuideStepOutput[];
};

export type AiOutputUnion =
  | PreviewModeOutput
  | PaywallSummaryOutput
  | FashionFullResultOutput
  | HomeFullResultOutput
  | BeautyFullResultOutput
  | PdfModeOutput
  | FormHintsOutput
  | GuideOutput;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function hasString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPreviewModeOutput(value: unknown): value is PreviewModeOutput {
  if (!value || typeof value !== "object") return false;
  const typed = value as PreviewModeOutput;
  return (
    hasString(typed.key_insight) &&
    hasString(typed.main_risk) &&
    hasString(typed.next_step) &&
    hasString(typed.preview_summary)
  );
}

function isPaywallSummaryOutput(value: unknown): value is PaywallSummaryOutput {
  if (!value || typeof value !== "object") return false;
  const typed = value as PaywallSummaryOutput;
  return (
    hasString(typed.product_name) &&
    hasString(typed.short_summary) &&
    isStringArray(typed.value_bullets) &&
    hasString(typed.unlock_outcome)
  );
}

function isFashionFullResultOutput(value: unknown): value is FashionFullResultOutput {
  if (!value || typeof value !== "object") return false;
  const typed = value as FashionFullResultOutput;
  return (
    hasString(typed.main_size) &&
    hasString(typed.alt_size) &&
    hasString(typed.fit_summary) &&
    ["low", "medium", "high"].includes(typed.risk_level) &&
    isStringArray(typed.risks) &&
    isStringArray(typed.advice) &&
    hasString(typed.short_conclusion) &&
    hasString(typed.logic_explanation) &&
    isStringArray(typed.important_considerations)
  );
}

function isHomeFullResultOutput(value: unknown): value is HomeFullResultOutput {
  if (!value || typeof value !== "object") return false;
  const typed = value as HomeFullResultOutput;
  return (
    hasString(typed.set_type) &&
    hasString(typed.budget_vector) &&
    isStringArray(typed.must_have) &&
    isStringArray(typed.optional) &&
    isStringArray(typed.composition_notes) &&
    isStringArray(typed.avoid) &&
    hasString(typed.short_conclusion) &&
    hasString(typed.logic_explanation) &&
    isStringArray(typed.important_considerations)
  );
}

function isBeautyFullResultOutput(value: unknown): value is BeautyFullResultOutput {
  if (!value || typeof value !== "object") return false;
  const typed = value as BeautyFullResultOutput;
  return (
    hasString(typed.routine_type) &&
    hasString(typed.main_focus) &&
    isStringArray(typed.am_steps) &&
    isStringArray(typed.pm_steps) &&
    isStringArray(typed.optional_steps) &&
    isStringArray(typed.warnings) &&
    isStringArray(typed.budget_notes) &&
    hasString(typed.short_conclusion) &&
    hasString(typed.logic_explanation) &&
    isStringArray(typed.important_considerations)
  );
}

function isPdfModeOutput(value: unknown): value is PdfModeOutput {
  if (!value || typeof value !== "object") return false;
  const typed = value as PdfModeOutput;
  return (
    hasString(typed.title) &&
    hasString(typed.summary) &&
    Array.isArray(typed.sections) &&
    typed.sections.every((section) => hasString(section.title) && isStringArray(section.items)) &&
    isStringArray(typed.recommendations) &&
    isStringArray(typed.notes) &&
    hasString(typed.disclaimer)
  );
}

function isFormHintsOutput(value: unknown): value is FormHintsOutput {
  if (!value || typeof value !== "object") return false;
  const typed = value as FormHintsOutput;
  if (!typed.hints || typeof typed.hints !== "object") return false;
  return Object.values(typed.hints).every((item) => typeof item === "string");
}

function isGuideOutput(value: unknown): value is GuideOutput {
  if (!value || typeof value !== "object") return false;
  const typed = value as GuideOutput;
  return (
    hasString(typed.welcome_title) &&
    hasString(typed.welcome_text) &&
    hasString(typed.start_label) &&
    hasString(typed.skip_label) &&
    Array.isArray(typed.steps) &&
    typed.steps.length === 3 &&
    typed.steps.every(
      (step) =>
        typeof step.id === "number" &&
        hasString(step.target_id) &&
        hasString(step.title) &&
        hasString(step.text) &&
        hasString(step.next_label)
    )
  );
}

export function validateAiOutput(
  domain: AiScenarioDomain,
  mode: AiMode,
  output: unknown
): output is AiOutputUnion {
  if (domain === "guide") {
    return mode === "guide" ? isGuideOutput(output) : false;
  }

  if (mode === "preview") return isPreviewModeOutput(output);
  if (mode === "paywall_summary") return isPaywallSummaryOutput(output);
  if (mode === "pdf") return isPdfModeOutput(output);
  if (mode === "form_hint") return isFormHintsOutput(output);

  if (mode === "full_result") {
    if (domain === "fashion") return isFashionFullResultOutput(output);
    if (domain === "home") return isHomeFullResultOutput(output);
    return isBeautyFullResultOutput(output);
  }

  return false;
}

