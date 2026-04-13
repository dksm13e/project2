import type { BeautyInterpretation } from "@/lib/ai/interpretation";
import type {
  BeautyFullResultOutput,
  FormHintsOutput,
  PaywallSummaryOutput,
  PdfModeOutput,
  PreviewModeOutput
} from "@/lib/ai/outputSchemas";

type Inputs = Record<string, string>;

function asBeautyInterpretation(interpretation: unknown): BeautyInterpretation {
  return interpretation as BeautyInterpretation;
}

function concernLabel(code: string): string {
  const map: Record<string, string> = {
    dehydration: "обезвоженность",
    redness: "покраснение",
    acne: "акне",
    "post-acne": "постакне",
    dullness: "тусклость",
    "uneven-tone": "неровный тон",
    wrinkles: "морщины",
    reactivity: "реактивность",
    barrier: "нарушенный барьер"
  };
  return map[code] ?? code;
}

function formatConcerns(codes: string[]): string {
  if (!codes.length) return "базовая стабилизация";
  return codes.map(concernLabel).join(", ");
}

function buildBaseSteps(beauty: BeautyInterpretation): { am: string[]; pm: string[] } {
  const am = ["мягкое очищение", "увлажняющий слой", "SPF"];
  const pm = ["мягкое очищение", "восстановление барьера"];

  const canUseActivesAggressively =
    beauty.normalized.sensitivity !== "high" &&
    beauty.normalized.experience !== "beginner" &&
    beauty.irritation_load !== "high";

  if (beauty.normalized.active_attitude === "acids_ok") {
    pm.splice(
      1,
      0,
      canUseActivesAggressively
        ? "эксфолиант 2-3 раза в неделю"
        : "мягкий кислотный шаг 1 раз в неделю с контролем реакции"
    );
  }

  if (beauty.normalized.active_attitude === "retinoids_ok") {
    pm.splice(
      1,
      0,
      canUseActivesAggressively
        ? "ретиноидный шаг с постепенным повышением частоты"
        : "ретиноидный шаг в буферном режиме 1-2 раза в неделю"
    );
  }

  if (beauty.normalized.active_attitude === "without_actives") {
    pm.push("успокаивающий support-step без активов");
  }

  if (beauty.normalized.routine_time === "am") {
    return { am, pm: ["вечерний минимум: очищение + восстановление"] };
  }
  if (beauty.normalized.routine_time === "pm") {
    return { am: ["утренний минимум: мягкое очищение + SPF"], pm };
  }
  return { am, pm };
}

function budgetMode(budget: number | null): "tight" | "balanced" | "extended" {
  if (!budget || budget <= 0) return "balanced";
  if (budget < 3500) return "tight";
  if (budget < 9000) return "balanced";
  return "extended";
}

function buildAvoidCombinations(beauty: BeautyInterpretation): string[] {
  const combinations = [
    "несколько агрессивных активов в один вечер на старте",
    "повышение частоты активов без стабильной переносимости",
    "игнорирование SPF при работе с активами"
  ];

  if (beauty.product_roles.includes("retinoid") && beauty.product_roles.includes("exfoliant")) {
    combinations.unshift("совмещение retinoid + exfoliant в один вечер");
  }
  if (beauty.normalized.sensitivity === "high") {
    combinations.push("любая эскалация схемы без промежуточного периода адаптации");
  }

  return [...new Set(combinations)];
}

function buildFull(inputs: Inputs, interpretation: unknown): BeautyFullResultOutput {
  const beauty = asBeautyInterpretation(interpretation);
  const { am, pm } = buildBaseSteps(beauty);
  const mode = budgetMode(beauty.normalized.budget_rub);
  const concernText = formatConcerns(beauty.normalized.concerns);

  const routineType =
    beauty.normalized.sensitivity === "high"
      ? "Бережный routine"
      : beauty.routine_state === "overloaded"
        ? "Декомпрессионный routine"
        : beauty.routine_state === "underbuilt"
          ? "Собирающий базу routine"
          : "Сбалансированный routine";

  const mustHaveSteps = ["очищение", "увлажнение", "SPF"];
  const optionalSteps = [
    "дополнительный успокаивающий шаг",
    "маска 1 раз в неделю",
    "локальный шаг под главный concern"
  ];

  const removeSteps = [
    beauty.routine_state === "overloaded"
      ? "одновременный запуск нескольких сильных активов"
      : "дублирующие шаги без явной роли",
    "избыточное количество новых средств за короткий период",
    beauty.normalized.failed_products
      ? "повтор продуктов/формул, которые уже не подошли"
      : "шаги, которые вызывают повторяющийся дискомфорт"
  ];

  const avoidCombinations = buildAvoidCombinations(beauty);

  const introPlan = [
    "Неделя 1: база (очищение + увлажнение + SPF).",
    "Неделя 2: добавить один активный шаг на низкой частоте.",
    beauty.normalized.experience === "beginner"
      ? "Неделя 3: сохранять прежнюю частоту и оценить переносимость."
      : "Неделя 3: при стабильной реакции можно умеренно повышать частоту.",
    beauty.normalized.sensitivity === "high"
      ? "Для высокой чувствительности увеличьте интервал между активными днями."
      : "При средней/низкой чувствительности допускается более быстрый темп."
  ];

  const budgetStructure =
    mode === "tight"
      ? ["70% бюджета на базу (cleanser + moisturizer + SPF)", "30% на один приоритетный active/support шаг"]
      : mode === "balanced"
        ? ["60% на базу", "25% на актив под основную цель", "15% на support-step"]
        : ["50% база", "30% рабочие активы", "20% комфорт/поддержка"];

  const sensitivityNotes = [
    `Чувствительность: ${beauty.normalized.sensitivity}.`,
    beauty.normalized.fragrance_free === "yes"
      ? "Фокус на fragrance-free формулах."
      : "Fragrance-free не задано как жесткое требование, но при реактивности лучше избегать отдушек.",
    beauty.irritation_load === "high"
      ? "Потенциальная раздражающая нагрузка высокая — схема намеренно более мягкая."
      : beauty.irritation_load === "medium"
        ? "Раздражающая нагрузка умеренная — вводите активы поэтапно."
        : "Раздражающая нагрузка низкая при текущем наборе."
  ];

  const warnings = [
    "Не увеличивайте интенсивность при первых признаках раздражения.",
    "Не вводите новый актив чаще, чем позволяет переносимость.",
    "При устойчивом дискомфорте нужен очный профильный специалист."
  ];

  const summary = `Тип routine: ${routineType}. Фокус: ${concernText}.`;

  return {
    summary,
    confidence_level: beauty.confidence_level,
    confidence_score: beauty.confidence_score,
    interpretation_notes: beauty.interpretation_notes,
    interpretation_limitations: beauty.limitations,
    primary_recommendation: "Соберите устойчивую базу и вводите активы по одному в безопасной последовательности.",
    alternatives: [
      "Если не готовы к активам: держите только базовый успокаивающий routine.",
      "Если мало времени: минимальный AM + упрощенный PM без потери основы.",
      "Если бюджет ограничен: один рабочий актив лучше нескольких случайных."
    ],
    risks: [
      "Перегруз активами в один период ввода.",
      "Игнорирование чувствительности и текущих реакций кожи.",
      "Смешивание шагов без понимания роли каждого продукта."
    ],
    reasoning: [
      `Skin type: ${beauty.normalized.skin_type}, concerns: ${concernText}.`,
      `Опыт: ${beauty.normalized.experience}, active attitude: ${beauty.normalized.active_attitude}.`,
      `Роли продуктов: ${beauty.product_roles.join(", ") || "не распознаны"}, routine state: ${beauty.routine_state}.`
    ],
    action_steps: [
      "Соберите устойчивую базу на 7 дней.",
      "Добавьте один актив/поддерживающий шаг под главную цель.",
      "Оцените реакцию кожи и только потом усиливайте схему.",
      "Сохраняйте SPF как обязательный шаг."
    ],
    what_to_verify: [
      "Нет ли дублирования активов в текущем наборе.",
      "Что уже не подходило ранее и почему.",
      "Соответствие числа шагов вашему реальному режиму.",
      "Реакцию кожи на новый актив в течение 5-7 дней."
    ],
    what_to_avoid: avoidCombinations,
    simplified_variant: [
      "AM: очищение + увлажнение + SPF.",
      "PM: очищение + восстановление.",
      "Только один активный шаг после стабилизации базы."
    ],
    pdf_blocks: [
      { title: "Фокус и тип routine", items: [summary, ...sensitivityNotes] },
      { title: "AM / PM", items: [...am, ...pm] },
      { title: "Ввод и ограничения", items: [...introPlan, ...avoidCombinations] },
      { title: "Бюджетная структура", items: budgetStructure }
    ],
    routine_type: routineType,
    main_focus: `Основной фокус: ${concernText}.`,
    am_steps: am,
    pm_steps: pm,
    must_have_steps: mustHaveSteps,
    optional_steps: optionalSteps,
    remove_steps: removeSteps,
    avoid_combinations: avoidCombinations,
    introduction_plan: introPlan,
    budget_structure: budgetStructure,
    sensitivity_notes: sensitivityNotes,
    warnings
  };
}

export function runBeautyPreview(inputs: Inputs, interpretation: unknown): PreviewModeOutput {
  const full = buildFull(inputs, interpretation);
  return {
    key_insight: `${full.routine_type}. ${full.main_focus}`,
    main_risk: full.risks[0],
    next_step: full.action_steps[0],
    preview_summary: "Показан только первичный вектор. Полная последовательность шагов, ввод и ограничения откроются после оплаты.",
    confidence: full.confidence_level,
    interpretation_limitations: full.interpretation_limitations.slice(0, 2)
  };
}

export function runBeautyPaywall(inputs: Inputs, interpretation: unknown): PaywallSummaryOutput {
  const full = buildFull(inputs, interpretation);
  return {
    product_name: "Полный разбор ухода",
    short_summary:
      "Определены тип routine и главный фокус. Полный разбор покажет AM/PM структуру, что убрать и как вводить шаги безопасно.",
    value_bullets: [
      "AM/PM структура с учетом чувствительности",
      "Что оставить, что убрать и что не сочетать",
      "План безопасного ввода active/support шагов",
      "Бюджетная структура и упрощенный вариант"
    ],
    unlock_outcome: "После оплаты открывается полный структурированный routine + PDF + код доступа.",
    confidence_note:
      full.confidence_level === "high"
        ? "Интерпретация уверенная: данных достаточно для персонализированного вектора."
        : full.confidence_level === "medium"
          ? "Интерпретация средняя: рабочая логика есть, но часть данных ограничена."
          : "Интерпретация ограничена: в полном разборе явно показаны факторы, снижающие точность."
  };
}

export function runBeautyFull(inputs: Inputs, interpretation: unknown): BeautyFullResultOutput {
  return buildFull(inputs, interpretation);
}

export function runBeautyPdf(inputs: Inputs, interpretation: unknown): PdfModeOutput {
  const full = buildFull(inputs, interpretation);
  return {
    title: "Beauty Routine Report",
    summary: full.summary,
    sections: [
      ...full.pdf_blocks,
      { title: "Что убрать", items: full.remove_steps },
      { title: "Warnings", items: full.warnings }
    ],
    recommendations: full.action_steps,
    notes: [...full.what_to_verify, ...full.interpretation_limitations],
    disclaimer:
      "Результат является информационным и не заменяет медицинскую консультацию. При высокой реактивности используйте консервативный темп ввода."
  };
}

export function runBeautyFormHints(): FormHintsOutput {
  return {
    hints: {
      concerns: "Выберите основные concerns — это определяет фокус routine.",
      sensitivity_level: "Чувствительность влияет на интенсивность и темп ввода активов.",
      experience_level: "Темп ввода активов зависит от вашего опыта в уходе.",
      desired_steps: "Честно задайте желаемое количество шагов — это снижает риск срыва рутины.",
      routine_time: "Можно собрать только утро, только вечер или оба блока.",
      not_suitable_products: "Что уже не подошло помогает убрать повторяющиеся ошибки.",
      active_attitude: "Отношение к активам влияет на агрессивность схемы.",
      fragrance_free: "Если кожа реактивна, fragrance-free часто снижает риск раздражения.",
      reference_url: "По ссылке AI распознает роль продукта в routine.",
      current_products_photo: "Фото текущих продуктов добавляет image-aware слой распознавания ролей."
    }
  };
}
