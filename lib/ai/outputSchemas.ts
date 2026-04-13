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

export type ConfidenceLevel = "low" | "medium" | "high";

export const AI_OUTPUT_SCHEMAS = {
  fashion: {
    preview: "fashion.preview.v2",
    paywall_summary: "fashion.paywall_summary.v2",
    full_result: "fashion.full_result.v2",
    pdf: "fashion.pdf.v2",
    form_hint: "fashion.form_hint.v2"
  },
  home: {
    preview: "home.preview.v2",
    paywall_summary: "home.paywall_summary.v2",
    full_result: "home.full_result.v2",
    pdf: "home.pdf.v2",
    form_hint: "home.form_hint.v2"
  },
  beauty: {
    preview: "beauty.preview.v2",
    paywall_summary: "beauty.paywall_summary.v2",
    full_result: "beauty.full_result.v2",
    pdf: "beauty.pdf.v2",
    form_hint: "beauty.form_hint.v2"
  },
  guide: {
    guide: "guide.onboarding.v2"
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
  confidence: ConfidenceLevel;
  interpretation_limitations: string[];
};

export type PaywallSummaryOutput = {
  product_name: string;
  short_summary: string;
  value_bullets: string[];
  unlock_outcome: string;
  confidence_note: string;
};

export type FullResultBase = {
  summary: string;
  confidence_level: ConfidenceLevel;
  confidence_score: number;
  interpretation_notes: string[];
  interpretation_limitations: string[];
  primary_recommendation: string;
  alternatives: string[];
  risks: string[];
  reasoning: string[];
  action_steps: string[];
  what_to_verify: string[];
  what_to_avoid: string[];
  simplified_variant: string[];
  pdf_blocks: Array<{ title: string; items: string[] }>;
};

export type FashionFullResultOutput = FullResultBase & {
  recognized_category: string;
  category_confidence: ConfidenceLevel;
  main_size: string;
  alt_size: string;
  logic_of_choice: string;
  key_risk_zones: string[];
  material_impact: string[];
  pre_purchase_checks: string[];
  recommendation_shift_factors: string[];
};

export type HomeFullResultOutput = FullResultBase & {
  set_type: string;
  visual_strategy: string;
  must_have: string[];
  optional_positions: string[];
  later_buy: string[];
  budget_logic: string[];
  composition_logic: string[];
  material_tips: string[];
  color_tips: string[];
  scale_recommendations: string[];
  avoid_mistakes: string[];
  skip_for_now: string[];
};

export type BeautyFullResultOutput = FullResultBase & {
  routine_type: string;
  main_focus: string;
  am_steps: string[];
  pm_steps: string[];
  must_have_steps: string[];
  optional_steps: string[];
  remove_steps: string[];
  avoid_combinations: string[];
  introduction_plan: string[];
  budget_structure: string[];
  sensitivity_notes: string[];
  warnings: string[];
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

function hasConfidence(value: unknown): value is ConfidenceLevel {
  return value === "low" || value === "medium" || value === "high";
}

function isPreviewModeOutput(value: unknown): value is PreviewModeOutput {
  if (!value || typeof value !== "object") return false;
  const typed = value as PreviewModeOutput;
  return (
    hasString(typed.key_insight) &&
    hasString(typed.main_risk) &&
    hasString(typed.next_step) &&
    hasString(typed.preview_summary) &&
    hasConfidence(typed.confidence) &&
    isStringArray(typed.interpretation_limitations)
  );
}

function isPaywallSummaryOutput(value: unknown): value is PaywallSummaryOutput {
  if (!value || typeof value !== "object") return false;
  const typed = value as PaywallSummaryOutput;
  return (
    hasString(typed.product_name) &&
    hasString(typed.short_summary) &&
    isStringArray(typed.value_bullets) &&
    hasString(typed.unlock_outcome) &&
    hasString(typed.confidence_note)
  );
}

function isFullResultBase(value: unknown): value is FullResultBase {
  if (!value || typeof value !== "object") return false;
  const typed = value as FullResultBase;
  return (
    hasString(typed.summary) &&
    hasConfidence(typed.confidence_level) &&
    typeof typed.confidence_score === "number" &&
    isStringArray(typed.interpretation_notes) &&
    isStringArray(typed.interpretation_limitations) &&
    hasString(typed.primary_recommendation) &&
    isStringArray(typed.alternatives) &&
    isStringArray(typed.risks) &&
    isStringArray(typed.reasoning) &&
    isStringArray(typed.action_steps) &&
    isStringArray(typed.what_to_verify) &&
    isStringArray(typed.what_to_avoid) &&
    isStringArray(typed.simplified_variant) &&
    Array.isArray(typed.pdf_blocks) &&
    typed.pdf_blocks.every((block) => hasString(block.title) && isStringArray(block.items))
  );
}

function isFashionFullResultOutput(value: unknown): value is FashionFullResultOutput {
  if (!isFullResultBase(value)) return false;
  const typed = value as FashionFullResultOutput;
  return (
    hasString(typed.recognized_category) &&
    hasConfidence(typed.category_confidence) &&
    hasString(typed.main_size) &&
    hasString(typed.alt_size) &&
    hasString(typed.logic_of_choice) &&
    isStringArray(typed.key_risk_zones) &&
    isStringArray(typed.material_impact) &&
    isStringArray(typed.pre_purchase_checks) &&
    isStringArray(typed.recommendation_shift_factors)
  );
}

function isHomeFullResultOutput(value: unknown): value is HomeFullResultOutput {
  if (!isFullResultBase(value)) return false;
  const typed = value as HomeFullResultOutput;
  return (
    hasString(typed.set_type) &&
    hasString(typed.visual_strategy) &&
    isStringArray(typed.must_have) &&
    isStringArray(typed.optional_positions) &&
    isStringArray(typed.later_buy) &&
    isStringArray(typed.budget_logic) &&
    isStringArray(typed.composition_logic) &&
    isStringArray(typed.material_tips) &&
    isStringArray(typed.color_tips) &&
    isStringArray(typed.scale_recommendations) &&
    isStringArray(typed.avoid_mistakes) &&
    isStringArray(typed.skip_for_now)
  );
}

function isBeautyFullResultOutput(value: unknown): value is BeautyFullResultOutput {
  if (!isFullResultBase(value)) return false;
  const typed = value as BeautyFullResultOutput;
  return (
    hasString(typed.routine_type) &&
    hasString(typed.main_focus) &&
    isStringArray(typed.am_steps) &&
    isStringArray(typed.pm_steps) &&
    isStringArray(typed.must_have_steps) &&
    isStringArray(typed.optional_steps) &&
    isStringArray(typed.remove_steps) &&
    isStringArray(typed.avoid_combinations) &&
    isStringArray(typed.introduction_plan) &&
    isStringArray(typed.budget_structure) &&
    isStringArray(typed.sensitivity_notes) &&
    isStringArray(typed.warnings)
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
