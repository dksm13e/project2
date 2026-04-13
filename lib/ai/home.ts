import type {
  FormHintsOutput,
  HomeFullResultOutput,
  PaywallSummaryOutput,
  PdfModeOutput,
  PreviewModeOutput
} from "@/lib/ai/outputSchemas";

type Inputs = Record<string, string>;

function toNum(value: string | undefined): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildFull(inputs: Inputs): HomeFullResultOutput {
  const roomType = inputs.room_type || "комнаты";
  const area = toNum(inputs.room_area);
  const budget = toNum(inputs.budget_rub) ?? 0;

  const setType =
    area === null
      ? "Сбалансированный набор"
      : area < 14
        ? "Компактный набор"
        : area < 24
          ? "Сбалансированный набор"
          : "Расширенный набор";

  const budgetVector =
    budget < 80000
      ? "Бюджетный: фокус на базе"
      : budget < 180000
        ? "Сбалансированный: база + комфорт"
        : "Расширенный: база + акценты";

  return {
    set_type: `${setType} для ${roomType}`,
    budget_vector: budgetVector,
    must_have: ["Якорный предмет", "Функциональное хранение", "Базовый свет"],
    optional: ["Текстиль для атмосферы", "Акцентный декор", "Дополнительный свет"],
    composition_notes: [
      "Сначала расставьте крупные предметы и проверьте проходы.",
      "Оставьте визуально спокойный центр комнаты.",
      "Повторяйте 1-2 материала, чтобы интерьер выглядел цельно."
    ],
    avoid: [
      "Покупка декора до базовой мебели.",
      "Слишком много мелких акцентов сразу.",
      "Смешение конфликтующих оттенков дерева и металла."
    ],
    short_conclusion: "Сначала база, затем комфорт, и только потом акценты.",
    logic_explanation:
      "Приоритет построен от функции комнаты: сначала обязательные позиции, затем дополнительные, чтобы не выйти за бюджет и сохранить композицию.",
    important_considerations: [
      "Проверьте реальные размеры до покупки.",
      "Оставляйте запас на доставку и сборку.",
      "Согласуйте цвет света в одном диапазоне."
    ]
  };
}

export function runHomePreview(inputs: Inputs): PreviewModeOutput {
  const full = buildFull(inputs);
  return {
    key_insight: `Тип набора: ${full.set_type}.`,
    main_risk: full.avoid[0],
    next_step: "Перед оплатой проверьте, что в форме указан реальный бюджет и площадь.",
    preview_summary: "Направление по набору определено, но детальный состав и приоритеты пока скрыты."
  };
}

export function runHomePaywall(inputs: Inputs): PaywallSummaryOutput {
  const full = buildFull(inputs);
  return {
    product_name: "Полный разбор для дома",
    short_summary: `Предварительно выбран тип набора: ${full.set_type}. Для уверенного решения нужен полный состав.`,
    value_bullets: [
      "Что обязательно купить сначала",
      "Что можно добавить позже",
      "Логика бюджета без лишних трат",
      "Советы по композиции и типовые ошибки"
    ],
    unlock_outcome: "После оплаты вы получите полный разбор, PDF и код доступа."
  };
}

export function runHomeFull(inputs: Inputs): HomeFullResultOutput {
  return buildFull(inputs);
}

export function runHomePdf(inputs: Inputs): PdfModeOutput {
  const full = buildFull(inputs);
  return {
    title: "Разбор для дома",
    summary: full.logic_explanation,
    sections: [
      { title: "Тип набора", items: [full.set_type, full.budget_vector] },
      { title: "Обязательные покупки", items: full.must_have },
      { title: "Опционально", items: full.optional }
    ],
    recommendations: full.composition_notes,
    notes: full.important_considerations,
    disclaimer: "Разбор носит информационный характер и не является дизайнерским проектом."
  };
}

export function runHomeFormHints(): FormHintsOutput {
  return {
    hints: {
      room_type: "Тип комнаты задает приоритеты в покупках.",
      style: "Стиль помогает собрать цельный, а не случайный набор.",
      budget_rub: "Укажите реальный бюджет, чтобы советы были применимы.",
      room_area: "Площадь важна для масштаба мебели и проходов.",
      existing_items: "Перечислите то, что точно остается в комнате.",
      reference_url: "Ссылка на понравившийся товар поможет точнее попасть в стиль."
    }
  };
}

