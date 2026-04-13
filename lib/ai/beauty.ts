import type {
  BeautyFullResultOutput,
  FormHintsOutput,
  PaywallSummaryOutput,
  PdfModeOutput,
  PreviewModeOutput
} from "@/lib/ai/outputSchemas";

type Inputs = Record<string, string>;

function buildFull(inputs: Inputs): BeautyFullResultOutput {
  const skinType = inputs.skin_type || "комбинированная";
  const goal = inputs.main_goal || "стабильный уход";
  const sensitivity = inputs.sensitivity_level || "medium";

  const routineType =
    sensitivity === "high" ? "Бережный routine" : goal === "acne" ? "Контроль высыпаний" : "Сбалансированный routine";

  const mainFocus =
    goal === "hydration"
      ? "Восстановление увлажнения и барьера"
      : goal === "acne"
        ? "Мягкий контроль воспалений без перегруза"
        : "Стабильная база и постепенное улучшение текстуры";

  return {
    routine_type: routineType,
    main_focus: `${mainFocus} для типа кожи: ${skinType}.`,
    am_steps: ["Мягкое очищение", "Увлажнение", "SPF"],
    pm_steps: ["Очищение", "Актив по цели", "Восстановление"],
    optional_steps: ["Успокаивающая маска 1-2 раза в неделю", "Точечный уход при необходимости"],
    warnings: [
      "Не вводите сразу несколько активов.",
      "Не повышайте частоту при раздражении.",
      "Не пропускайте SPF в дневном уходе."
    ],
    budget_notes: [
      "Сначала закрывайте базу: очищение, увлажнение, SPF.",
      "Один рабочий актив лучше нескольких случайных.",
      "Часть бюджета оставляйте на повтор базовых средств."
    ],
    short_conclusion: "Стабильная база + постепенное введение активов = лучший прогноз для кожи.",
    logic_explanation:
      "Логика строится от чувствительности и цели: сначала базовая переносимость, затем точечные активы в безопасной последовательности.",
    important_considerations: [
      "Тестируйте новый актив минимум 5-7 дней.",
      "При выраженной реакции снизьте частоту и упростите routine.",
      "При стойком дискомфорте обратитесь к профильному специалисту."
    ]
  };
}

export function runBeautyPreview(inputs: Inputs): PreviewModeOutput {
  const full = buildFull(inputs);
  return {
    key_insight: `Тип ухода: ${full.routine_type}.`,
    main_risk: full.warnings[0],
    next_step: "Перед оплатой уточните чувствительность и текущие средства в форме.",
    preview_summary: "Основное направление по уходу определено, но последовательность шагов пока скрыта."
  };
}

export function runBeautyPaywall(inputs: Inputs): PaywallSummaryOutput {
  const full = buildFull(inputs);
  return {
    product_name: "Полный разбор ухода",
    short_summary: `Определен базовый тип ухода: ${full.routine_type}. Полный разбор даст порядок шагов и ограничения.`,
    value_bullets: [
      "Пошаговый AM/PM план",
      "Обязательные и опциональные шаги",
      "Что лучше избегать и почему",
      "Бюджетные ориентиры по уходу"
    ],
    unlock_outcome: "После оплаты вы получите полный разбор, PDF и код доступа."
  };
}

export function runBeautyFull(inputs: Inputs): BeautyFullResultOutput {
  return buildFull(inputs);
}

export function runBeautyPdf(inputs: Inputs): PdfModeOutput {
  const full = buildFull(inputs);
  return {
    title: "Разбор ухода",
    summary: full.logic_explanation,
    sections: [
      { title: "Фокус ухода", items: [full.routine_type, full.main_focus] },
      { title: "Утро (AM)", items: full.am_steps },
      { title: "Вечер (PM)", items: full.pm_steps }
    ],
    recommendations: [...full.optional_steps, ...full.budget_notes],
    notes: full.important_considerations,
    disclaimer: "Разбор носит информационный характер и не заменяет медицинскую консультацию."
  };
}

export function runBeautyFormHints(): FormHintsOutput {
  return {
    hints: {
      skin_type: "Тип кожи влияет на базовую структуру ухода.",
      main_goal: "Главная цель поможет выбрать активы без перегруза.",
      sensitivity_level: "Чувствительность влияет на темп введения новых шагов.",
      budget_rub: "Реальный бюджет поможет собрать устойчивый routine.",
      reference_url: "Можно добавить продукт, который хотите проверить.",
      current_routine: "Коротко опишите текущий уход, чтобы избежать конфликтов шагов."
    }
  };
}

