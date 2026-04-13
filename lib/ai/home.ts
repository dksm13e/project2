import type { HomeInterpretation } from "@/lib/ai/interpretation";
import type {
  FormHintsOutput,
  HomeFullResultOutput,
  PaywallSummaryOutput,
  PdfModeOutput,
  PreviewModeOutput
} from "@/lib/ai/outputSchemas";

type Inputs = Record<string, string>;

function asHomeInterpretation(interpretation: unknown): HomeInterpretation {
  return interpretation as HomeInterpretation;
}

function areaBand(area: number | null): "compact" | "balanced" | "expanded" {
  if (!area || area <= 0) return "balanced";
  if (area < 14) return "compact";
  if (area < 26) return "balanced";
  return "expanded";
}

function buildCoreSet(roomType: string, goal: string, constraints: string[]): string[] {
  const byRoom: Record<string, string[]> = {
    bedroom: ["кровать/матрас", "прикроватный свет", "хранение одежды"],
    living: ["диван или основная посадка", "основной свет", "базовое хранение"],
    workspace: ["рабочий стол", "эргономичное кресло", "направленный свет"],
    kids: ["безопасная базовая мебель", "закрытое хранение", "мягкий свет"],
    kitchen: ["рабочая поверхность", "организация хранения", "функциональный свет"],
    hallway: ["организация входной зоны", "зеркало", "компактное хранение"],
    bathroom: ["влагостойкое хранение", "зеркальная зона", "антискользящие решения"],
    balcony: ["компактная посадка", "мобильное хранение", "многофункциональный текстиль"],
    studio: ["зонирующий элемент", "универсальная посадка", "встроенное хранение"]
  };

  const base = byRoom[roomType] ?? ["якорный предмет", "функциональный свет", "базовое хранение"];
  if (goal.includes("workspace")) base.push("тихая рабочая зона");
  if (goal.includes("storage")) base.push("дополнительное вертикальное хранение");
  if (constraints.includes("kids-or-pets")) base.push("износостойкие и легко очищаемые поверхности");
  return [...new Set(base)];
}

function buildVisualStrategy(style: string, tags: string[], roomShape: string): string {
  const shapeMode =
    roomShape === "narrow"
      ? "линейная композиция вдоль длинной оси"
      : roomShape === "elongated"
        ? "двухзонная композиция с мягким разделением"
        : roomShape === "square"
          ? "центральная композиция вокруг одного якоря"
          : "гибкая композиция с читаемым функциональным центром";

  const styleTone =
    style === "japandi"
      ? "спокойный контраст дерева и мягких фактур"
      : style === "quiet-luxury-light"
        ? "сдержанный premium с чистыми линиями и мягким светом"
        : style === "storage-first"
          ? "функциональная визуальная система с минимумом визуального шума"
          : "чистая база с одним выразительным акцентом";

  const imageTagHint = tags.length ? `Подтверждающие style tags: ${tags.slice(0, 3).join(", ")}.` : "";
  return `${styleTone}; ${shapeMode}. ${imageTagHint}`.trim();
}

function buildFull(inputs: Inputs, interpretation: unknown): HomeFullResultOutput {
  const home = asHomeInterpretation(interpretation);
  const roomType = home.normalized.room_type;
  const band = areaBand(home.normalized.room_area);
  const budget = home.normalized.budget_rub ?? 0;
  const style = home.normalized.style;
  const constraints = home.normalized.constraints;

  const setType =
    band === "compact"
      ? "Компактный адаптивный набор"
      : band === "expanded"
        ? "Расширенный набор с акцентами"
        : "Сбалансированный набор";

  const visualStrategy = buildVisualStrategy(style, home.style_tags, home.normalized.room_shape);
  const mustHave = buildCoreSet(roomType, home.normalized.goal, constraints);

  const optional = [
    style.includes("minimal") ? "акцентный текстиль для глубины без перегруза" : "текстиль для баланса фактур",
    constraints.includes("rental") ? "мобильный декор без сложного монтажа" : "локальный декоративный акцент",
    "второй сценарий освещения"
  ];

  const laterBuy = [
    "дополнительный декор после стабилизации базы",
    constraints.includes("kids-or-pets")
      ? "деликатные фактуры только после проверки реальной практичности"
      : "второй комплект текстиля под сезон",
    "второй акцентный предмет только при остатке бюджета"
  ];

  const budgetLogic = [
    budget <= 0
      ? "Бюджет не указан: сначала фиксируйте базу и только потом переходите к акцентам."
      : budget < 100000
        ? "Бюджетный вектор: 60% база, 30% хранение/свет, 10% декор."
        : budget < 220000
          ? "Сбалансированный вектор: 50% база, 30% комфорт, 20% акценты."
          : "Расширенный вектор: 45% база, 30% комфорт, 25% акценты.",
    "Сначала покупайте то, что влияет на функцию комнаты каждый день.",
    "Нестабильные категории (сложный декор, вторичные акценты) переносите в later-buy."
  ];

  const compositionLogic = [
    `Форма комнаты: ${home.normalized.room_shape}, высота: ${home.normalized.ceiling_height}.`,
    band === "compact"
      ? "Для компактной площади держите проходы свободными и избегайте визуально тяжелых масс."
      : "Используйте 2 уровня масштаба: крупный якорь + средние поддерживающие элементы.",
    constraints.includes("low-ceiling")
      ? "При низких потолках избегайте слишком высоких и массивных вертикалей."
      : "Допустима работа с вертикальными акцентами при сохранении легкости композиции."
  ];

  const materialTips = [
    home.normalized.liked_materials.length
      ? `Приоритетные материалы: ${home.normalized.liked_materials.join(", ")}.`
      : "Материалы не заданы — используйте нейтральный микс: дерево + текстиль + матовые поверхности.",
    constraints.includes("kids-or-pets")
      ? "С учетом детей/животных выбирайте практичные, легко очищаемые покрытия и текстиль."
      : "Допустимы более деликатные фактуры при спокойной эксплуатации.",
    "Сочетайте 2-3 фактуры, но повторяйте их в разных точках комнаты для связности."
  ];

  const colorTips = [
    home.normalized.liked_colors.length
      ? `Базовые цвета: ${home.normalized.liked_colors.join(", ")}.`
      : "Базовая палитра: теплые нейтралы + 1 спокойный акцент.",
    home.normalized.disliked_colors.length
      ? `Избегайте: ${home.normalized.disliked_colors.join(", ")}.`
      : "Не используйте более двух активных акцентных цветов одновременно.",
    "Контраст лучше усиливать фактурой/светом, а не только цветом."
  ];

  const scaleRecommendations = [
    band === "compact"
      ? "Выбирайте визуально легкие предметы на ножках и умеренную глубину мебели."
      : "Разрешены более плотные объемы, но оставляйте читаемый центр комнаты.",
    home.normalized.room_shape === "narrow"
      ? "Для узкой комнаты — вытянутая композиция вдоль длинной стены без поперечного перегруза."
      : "Для квадратной комнаты — композиция вокруг одного смыслового центра.",
    "Проверяйте реальные габариты до покупки, особенно проходы и зоны открывания."
  ];

  const avoidMistakes = [
    "Покупка декора раньше базовых функциональных позиций.",
    "Смешение конфликтующих фактур без повторяющейся связки.",
    constraints.includes("rental")
      ? "Необратимые решения (сложный монтаж/перепланировка) в rental-сценарии."
      : "Слишком крупный якорь в ограниченной геометрии."
  ];

  const skipForNow = [
    "дорогие вторичные акценты, пока не стабилизирован основной набор",
    home.normalized.existing_items.length
      ? "дублирующие предметы, если текущие позиции уже закрывают функциональность"
      : "дублирующие предметы хранения без проверки реальной нехватки",
    "сложные декоративные комбинации до выравнивания палитры и масштаба"
  ];

  const summary = `${setType} для ${roomType}. Стиль: ${style}. Ограничения: ${
    constraints.length ? constraints.join(", ") : "не выражены"
  }.`;

  return {
    summary,
    confidence_level: home.confidence_level,
    confidence_score: home.confidence_score,
    interpretation_notes: home.interpretation_notes,
    interpretation_limitations: home.limitations,
    primary_recommendation:
      "Соберите функциональную базу, затем добавляйте комфорт и только после этого акцентные покупки.",
    alternatives: [
      "Если бюджет ограничен: уменьшайте декор и усиливайте универсальные базовые позиции.",
      constraints.includes("rental")
        ? "Если объект съемный: выбирайте мобильные и обратимые решения."
        : "Если план долгий: можно добавлять более индивидуальные акцентные решения.",
      home.normalized.goal.includes("workspace")
        ? "При workspace-цели усиливайте свет и эргономику раньше декоративных вложений."
        : "При cozy-цели уделяйте больше внимания свету и текстилю, чем количеству декора."
    ],
    risks: [
      "Перекос бюджета в неключевые категории.",
      "Нарушение масштаба из-за игнорирования площади и формы.",
      "Материальный конфликт (холодные/теплые фактуры без связки)."
    ],
    reasoning: [
      `Style tags: ${home.style_tags.join(", ") || "not-defined"}.`,
      `Image context: ${home.image_signals.filter((signal) => signal.source !== "none").length} источника.`,
      `Room band: ${band}, бюджет: ${budget > 0 ? `${budget} RUB` : "not-provided"}.`
    ],
    action_steps: [
      "Зафиксируйте must-have список.",
      "Распределите бюджет по приоритетам.",
      "Проверьте масштаб по габаритам и проходам.",
      "Перенесите вторичные покупки в later-buy."
    ],
    what_to_verify: [
      "Габариты ключевых позиций относительно комнаты и проходов.",
      "Совместимость материалов в одном световом сценарии.",
      "Реальную полезность каждой planned-покупки.",
      constraints.includes("rental") ? "Ограничения аренды перед покупкой/монтажом." : "Срок жизненного цикла выбранных решений."
    ],
    what_to_avoid: avoidMistakes,
    simplified_variant: [
      "Якорный предмет + функциональный свет + одно решение хранения.",
      "Один материал в базе и один в поддержке.",
      "Декор только после проверки функциональности."
    ],
    pdf_blocks: [
      { title: "Тип набора и визуальная стратегия", items: [summary, visualStrategy] },
      { title: "База и приоритеты", items: mustHave },
      { title: "Логика бюджета", items: budgetLogic },
      { title: "Композиция и масштаб", items: [...compositionLogic, ...scaleRecommendations] }
    ],
    set_type: setType,
    visual_strategy: visualStrategy,
    must_have: mustHave,
    optional_positions: optional,
    later_buy: laterBuy,
    budget_logic: budgetLogic,
    composition_logic: compositionLogic,
    material_tips: materialTips,
    color_tips: colorTips,
    scale_recommendations: scaleRecommendations,
    avoid_mistakes: avoidMistakes,
    skip_for_now: skipForNow
  };
}

export function runHomePreview(inputs: Inputs, interpretation: unknown): PreviewModeOutput {
  const full = buildFull(inputs, interpretation);
  return {
    key_insight: `${full.set_type}: ${full.visual_strategy}`,
    main_risk: full.risks[0],
    next_step: full.action_steps[0],
    preview_summary: "Показан только базовый вектор. Детальная бюджетная и композиционная логика раскрывается после оплаты.",
    confidence: full.confidence_level,
    interpretation_limitations: full.interpretation_limitations.slice(0, 2)
  };
}

export function runHomePaywall(inputs: Inputs, interpretation: unknown): PaywallSummaryOutput {
  const full = buildFull(inputs, interpretation);
  return {
    product_name: "Полный разбор для дома",
    short_summary: `Определены ${full.set_type.toLowerCase()} и визуальная стратегия. Полный разбор раскроет структуру must-have / optional / later-buy.`,
    value_bullets: [
      "Обязательные, optional и later-buy позиции",
      "Логика бюджета без лишних покупок",
      "Композиция, масштаб и material/color слой",
      "Ошибки, которых стоит избегать, и что не покупать сейчас"
    ],
    unlock_outcome: "После оплаты откроется полный структурированный план комнаты + PDF + код доступа.",
    confidence_note:
      full.confidence_level === "high"
        ? "Данных достаточно для уверенной стратегии."
        : full.confidence_level === "medium"
          ? "Стратегия рабочая, но часть параметров желательно уточнить."
          : "Данные ограничены: в полном разборе явно показано, где нужно доуточнение."
  };
}

export function runHomeFull(inputs: Inputs, interpretation: unknown): HomeFullResultOutput {
  return buildFull(inputs, interpretation);
}

export function runHomePdf(inputs: Inputs, interpretation: unknown): PdfModeOutput {
  const full = buildFull(inputs, interpretation);
  return {
    title: "Home Set Report",
    summary: full.summary,
    sections: [
      ...full.pdf_blocks,
      { title: "Material Layer", items: full.material_tips },
      { title: "Color Layer", items: full.color_tips },
      { title: "Что не покупать сейчас", items: full.skip_for_now }
    ],
    recommendations: full.action_steps,
    notes: [...full.what_to_verify, ...full.interpretation_limitations],
    disclaimer:
      "Результат носит рекомендательный характер. При неполных входных данных confidence снижается, а часть решений требует дополнительной проверки."
  };
}

export function runHomeFormHints(): FormHintsOutput {
  return {
    hints: {
      room_type: "Тип комнаты задает каркас must-have позиций.",
      room_area: "Площадь нужна для корректных рекомендаций по масштабу.",
      room_shape: "Форма комнаты влияет на композицию и распределение крупных предметов.",
      ceiling_height: "Высота потолков меняет выбор вертикалей и световых сценариев.",
      main_goal: "Цель определяет, что важнее: уют, storage, workspace или rental-практичность.",
      style: "Стиль задает визуальную стратегию и material/color вектор.",
      budget_rub: "Бюджет нужен, чтобы честно разделить must-have и later-buy.",
      must_keep: "Укажите, что точно остается — это влияет на совместимость набора.",
      first_priority_buy: "Это помогает AI расставить приоритеты в первом этапе.",
      liked_materials: "Материалы влияют на фактуры, практичность и визуальную глубину.",
      liked_colors: "Цветовые предпочтения помогают избежать конфликтов в палитре.",
      room_photo: "Фото комнаты добавляет image-aware контекст по масштабу и планировке.",
      reference_interior_photo: "Фото референса помогает выделить style tags.",
      existing_furniture_photo: "Фото текущей мебели помогает точнее оценить совместимость."
    }
  };
}
