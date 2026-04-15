import type {
  BeautyFullResultOutput,
  FashionFullResultOutput,
  HomeFullResultOutput,
  PaywallSummaryOutput,
  PdfModeOutput,
  PreviewModeOutput
} from "@/lib/ai/schemas";

type FullOutput = FashionFullResultOutput | HomeFullResultOutput | BeautyFullResultOutput;

function clampText(value: string, maxChars: number): string {
  const text = (value || "").trim();
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

function clampList(values: string[], maxItems: number, maxChars: number): string[] {
  return (values ?? []).filter(Boolean).slice(0, maxItems).map((item) => clampText(item, maxChars));
}

export function compactPreviewOutput(output: PreviewModeOutput): PreviewModeOutput {
  return {
    key_insight: clampText(output.key_insight, 170),
    main_risk: clampText(output.main_risk, 170),
    next_step: clampText(output.next_step, 170),
    preview_summary: clampText(output.preview_summary, 240),
    confidence: output.confidence,
    interpretation_limitations: clampList(output.interpretation_limitations, 2, 150)
  };
}

export function compactPaywallSummary(output: PaywallSummaryOutput): PaywallSummaryOutput {
  return {
    product_name: clampText(output.product_name, 80),
    short_summary: clampText(output.short_summary, 190),
    value_bullets: clampList(output.value_bullets, 4, 140),
    unlock_outcome: clampText(output.unlock_outcome, 220),
    confidence_note: clampText(output.confidence_note, 180)
  };
}

function compactFullBase<T extends FullOutput>(output: T): T {
  return {
    ...output,
    summary: clampText(output.summary, 260),
    interpretation_notes: clampList(output.interpretation_notes, 4, 160),
    interpretation_limitations: clampList(output.interpretation_limitations, 3, 160),
    primary_recommendation: clampText(output.primary_recommendation, 200),
    alternatives: clampList(output.alternatives, 4, 160),
    risks: clampList(output.risks, 4, 160),
    reasoning: clampList(output.reasoning, 4, 170),
    action_steps: clampList(output.action_steps, 5, 150),
    what_to_verify: clampList(output.what_to_verify, 5, 150),
    what_to_avoid: clampList(output.what_to_avoid, 4, 150),
    simplified_variant: clampList(output.simplified_variant, 3, 140),
    pdf_blocks: output.pdf_blocks.slice(0, 5).map((block) => ({
      title: clampText(block.title, 80),
      items: clampList(block.items, 4, 150)
    }))
  };
}

export function compactFullOutput(output: FullOutput): FullOutput {
  const compacted = compactFullBase(output);

  if ("main_size" in compacted) {
    return {
      ...compacted,
      logic_of_choice: clampText(compacted.logic_of_choice, 220),
      key_risk_zones: clampList(compacted.key_risk_zones, 5, 80),
      material_impact: clampList(compacted.material_impact, 4, 150),
      pre_purchase_checks: clampList(compacted.pre_purchase_checks, 4, 150),
      recommendation_shift_factors: clampList(compacted.recommendation_shift_factors, 4, 150)
    };
  }

  if ("set_type" in compacted) {
    return {
      ...compacted,
      visual_strategy: clampText(compacted.visual_strategy, 220),
      must_have: clampList(compacted.must_have, 5, 130),
      optional_positions: clampList(compacted.optional_positions, 4, 130),
      later_buy: clampList(compacted.later_buy, 4, 130),
      budget_logic: clampList(compacted.budget_logic, 4, 150),
      composition_logic: clampList(compacted.composition_logic, 4, 150),
      material_tips: clampList(compacted.material_tips, 4, 150),
      color_tips: clampList(compacted.color_tips, 4, 150),
      scale_recommendations: clampList(compacted.scale_recommendations, 4, 150),
      avoid_mistakes: clampList(compacted.avoid_mistakes, 4, 150),
      skip_for_now: clampList(compacted.skip_for_now, 4, 150)
    };
  }

  return {
    ...compacted,
    main_focus: clampText(compacted.main_focus, 170),
    am_steps: clampList(compacted.am_steps, 5, 130),
    pm_steps: clampList(compacted.pm_steps, 5, 130),
    must_have_steps: clampList(compacted.must_have_steps, 4, 130),
    optional_steps: clampList(compacted.optional_steps, 4, 130),
    remove_steps: clampList(compacted.remove_steps, 4, 130),
    avoid_combinations: clampList(compacted.avoid_combinations, 4, 150),
    introduction_plan: clampList(compacted.introduction_plan, 4, 150),
    budget_structure: clampList(compacted.budget_structure, 3, 130),
    sensitivity_notes: clampList(compacted.sensitivity_notes, 3, 150),
    warnings: clampList(compacted.warnings, 4, 150)
  };
}

export function compactPdfOutput(output: PdfModeOutput): PdfModeOutput {
  return {
    ...output,
    title: clampText(output.title, 90),
    summary: clampText(output.summary, 260),
    sections: output.sections.slice(0, 6).map((section) => ({
      title: clampText(section.title, 80),
      items: clampList(section.items, 5, 150)
    })),
    recommendations: clampList(output.recommendations, 6, 150),
    notes: clampList(output.notes, 6, 150),
    disclaimer: clampText(output.disclaimer, 260)
  };
}

