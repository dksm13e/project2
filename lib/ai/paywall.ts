import type { PaywallSummaryOutput, PreviewModeOutput } from "@/lib/ai/schemas";
import type { ScenarioDefinition } from "@/lib/scenarios";

function confidenceNote(preview: PreviewModeOutput): string {
  if (preview.confidence === "high") {
    return "Текущий вывод уверенный: данных достаточно для персонального разбора.";
  }
  if (preview.confidence === "medium") {
    return "Текущий вывод рабочий: часть факторов уже ясна, но детали откроются в полном разборе.";
  }
  return "Текущий вывод ограничен: полный разбор покажет, какие данные сильнее всего влияют на точность.";
}

export function buildFallbackPaywallSummaryFromScenario(scenario: ScenarioDefinition): PaywallSummaryOutput {
  return {
    product_name: scenario.paywallTitle,
    short_summary: scenario.fullOutcome,
    value_bullets: scenario.fullResultItems.slice(0, 4),
    unlock_outcome: "После оплаты откроется полный разбор, PDF и код доступа для повторного открытия результата.",
    confidence_note: "Предварительный вывод нужен для быстрой проверки направления, полный разбор раскрывает решение целиком."
  };
}

export function buildPaywallSummaryFromPreview(params: {
  scenario: ScenarioDefinition;
  preview: PreviewModeOutput;
}): PaywallSummaryOutput {
  return {
    product_name: params.scenario.paywallTitle,
    short_summary: `Уже определено: ${params.preview.key_insight}`,
    value_bullets: params.scenario.fullResultItems.slice(0, 4),
    unlock_outcome: `После оплаты откроется полный разбор: ${params.preview.next_step}. Также будет доступен PDF и код доступа.`,
    confidence_note: confidenceNote(params.preview)
  };
}

