import type {
  BeautyFullResultOutput,
  FashionFullResultOutput,
  HomeFullResultOutput,
  PdfModeOutput
} from "@/lib/ai/schemas";

type FullOutput = FashionFullResultOutput | HomeFullResultOutput | BeautyFullResultOutput;

function buildDisclaimer(full: FullOutput): string {
  if ("main_size" in full) {
    return "Результат носит аналитический характер. Перед покупкой обязательно сверяйте замеры товара.";
  }
  if ("set_type" in full) {
    return "Результат носит рекомендательный характер. Перед покупкой проверяйте габариты и совместимость в вашем помещении.";
  }
  return "Результат информационный и не заменяет медицинскую консультацию. При высокой реактивности нужен консервативный темп ввода.";
}

function buildTitle(full: FullOutput, scenarioTitle: string): string {
  if ("main_size" in full) return "Fashion Size Report";
  if ("set_type" in full) return "Home Set Report";
  if ("routine_type" in full) return "Beauty Routine Report";
  return `${scenarioTitle} Report`;
}

export function buildPdfPayloadFromFullResult(full: FullOutput, scenarioTitle: string): PdfModeOutput {
  const notes = [...full.interpretation_notes, ...full.interpretation_limitations].filter(Boolean);

  return {
    title: buildTitle(full, scenarioTitle),
    summary: full.summary,
    sections: full.pdf_blocks,
    recommendations: full.action_steps,
    notes,
    disclaimer: buildDisclaimer(full)
  };
}

