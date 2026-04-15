import { getAiRuntimeConfig, requestStructuredJson } from "@/lib/ai/client";
import { compactFullOutput, compactPaywallSummary, compactPdfOutput, compactPreviewOutput } from "@/lib/ai/compact";
import {
  extractImageInputs,
  interpretScenarioInputs,
  sanitizeInputsForPrompt,
  type FashionInterpretation
} from "@/lib/ai/interpretation";
import { getLiveSystemPrompt, getLiveUserPrompt } from "@/lib/ai/prompts";
import type {
  FashionFullResultOutput,
  FormHintsOutput,
  PaywallSummaryOutput,
  PdfModeOutput,
  PreviewModeOutput
} from "@/lib/ai/schemas";
import { validateAiOutput } from "@/lib/ai/schemas";

type Inputs = Record<string, string>;

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

function asFashionInterpretation(interpretation: unknown): FashionInterpretation {
  return interpretation as FashionInterpretation;
}

function hasStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function clampConfidence(value: number) {
  return Math.max(1, Math.min(99, Math.round(value)));
}

type FashionInterpretationPatch = {
  interpretation_notes?: string[];
  limitations?: string[];
  confidence_score?: number;
  confidence_level?: "low" | "medium" | "high";
  recognized_category?: string;
  source_category?: "explicit" | "inferred" | "fallback";
};

async function tryLiveFashionOutput<T extends PreviewModeOutput | FashionFullResultOutput | PdfModeOutput | PaywallSummaryOutput>(params: {
  mode: "preview" | "full_result" | "pdf" | "paywall_summary";
  inputs: Inputs;
  interpretation: FashionInterpretation;
  baseline: T;
}): Promise<T | null> {
  const runtime = getAiRuntimeConfig();
  if (!runtime.textLiveEnabled) return null;

  try {
    const promptInputs = sanitizeInputsForPrompt(params.inputs);
    const candidate = await requestStructuredJson<T>({
      task: `fashion.${params.mode}`,
      systemPrompt: getLiveSystemPrompt("fashion", params.mode),
      userPrompt: getLiveUserPrompt({
        domain: "fashion",
        mode: params.mode,
        inputs: promptInputs,
        interpretation: params.interpretation,
        baselineOutput: params.baseline
      }),
      maxOutputTokens:
        params.mode === "preview"
          ? 220
          : params.mode === "paywall_summary"
            ? 260
            : params.mode === "full_result"
              ? 920
              : 700,
      inputImages: extractImageInputs(params.inputs)
    });

    if (!validateAiOutput("fashion", params.mode, candidate)) {
      return null;
    }
    return candidate;
  } catch {
    return null;
  }
}

function normalizeSize(value: string): string {
  const raw = value.trim().toUpperCase();
  if (!raw) return "M";
  if (SIZE_ORDER.includes(raw)) return raw;
  if (["42", "44"].includes(raw)) return "S";
  if (["46", "48"].includes(raw)) return "M";
  if (["50", "52"].includes(raw)) return "L";
  if (["54", "56"].includes(raw)) return "XL";
  if (["58", "60"].includes(raw)) return "XXL";
  return "M";
}

function sizeFromBody(heightCm: number | null, weightKg: number | null): string {
  if (!heightCm || !weightKg) return "M";
  if (heightCm < 164 && weightKg < 56) return "S";
  if (heightCm > 188 && weightKg > 92) return "XL";
  if (weightKg > 84) return "L";
  if (weightKg < 58) return "S";
  return "M";
}

function shiftSize(base: string, steps: number): string {
  const index = SIZE_ORDER.indexOf(base);
  const safe = index === -1 ? 2 : index;
  return SIZE_ORDER[Math.max(0, Math.min(SIZE_ORDER.length - 1, safe + steps))];
}

function computeSizePair(fashion: FashionInterpretation): { main: string; alt: string } {
  const base = fashion.normalized.usual_size
    ? normalizeSize(fashion.normalized.usual_size)
    : sizeFromBody(fashion.normalized.height_cm, fashion.normalized.weight_kg);

  const fit = fashion.normalized.fit_intent;
  if (fit === "oversize") return { main: shiftSize(base, 1), alt: base };
  if (fit === "relaxed") return { main: base, alt: shiftSize(base, 1) };
  if (fit === "figure") return { main: base, alt: shiftSize(base, -1) };
  return { main: base, alt: shiftSize(base, 1) };
}

function categoryRiskZones(category: string, fitIntent: string, priorities: string[]): string[] {
  const defaultMap: Record<string, string[]> = {
    "футболка": ["грудь", "длина"],
    "худи": ["плечи", "рукав", "длина"],
    "свитшот": ["плечи", "рукав", "длина"],
    "рубашка": ["плечи", "грудь", "рукав"],
    "куртка": ["плечи", "грудь", "рукав", "длина"],
    "жилет": ["грудь", "талия"],
    "брюки": ["талия", "бедра", "длина"],
    "джинсы": ["талия", "бедра", "длина"],
    "шорты": ["талия", "бедра", "длина"],
    "платье": ["грудь", "талия", "длина"],
    "юбка": ["талия", "бедра", "длина"],
    "обувь": ["длина", "полнота"]
  };

  const fitExtra =
    fitIntent === "oversize"
      ? ["длина", "рукав"]
      : fitIntent === "figure"
        ? ["грудь", "талия"]
        : fitIntent === "relaxed"
          ? ["плечи", "грудь"]
          : [];

  const base = defaultMap[category] ?? ["плечи", "грудь", "длина"];
  return [...new Set([...priorities, ...fitExtra, ...base])];
}

function buildMaterialImpact(fashion: FashionInterpretation): string[] {
  const densityMap: Record<string, string> = {
    dense: "Плотный материал требует точнее попадать в плечи/корпус и хуже прощает ошибку размера.",
    medium: "Средняя плотность дает более стабильную посадку в daily-сценарии.",
    light: "Легкая ткань может вести себя по-разному в зависимости от кроя и подслоя."
  };

  return [
    ...fashion.material_profile.notes,
    `Состав: ${fashion.normalized.material_text}.`,
    densityMap[fashion.material_profile.density],
    fashion.material_profile.stretch === "high"
      ? "Высокая эластичность допускает мягкий запас по одной зоне."
      : "Низкая/умеренная эластичность требует точного совпадения в приоритетных зонах."
  ];
}

function buildFull(inputs: Inputs, interpretation: unknown): FashionFullResultOutput {
  const fashion = asFashionInterpretation(interpretation);
  const { main, alt } = computeSizePair(fashion);
  const category = fashion.normalized.recognized_category;
  const riskZones = categoryRiskZones(category, fashion.normalized.fit_intent, fashion.normalized.fit_priority);
  const materialImpact = buildMaterialImpact(fashion);

  const confidenceExplain =
    fashion.confidence_level === "high"
      ? "Интерпретация уверенная: категория и ключевые параметры распознаны достаточно точно."
      : fashion.confidence_level === "medium"
        ? "Интерпретация рабочая: часть параметров распознана косвенно и требует проверки."
        : "Интерпретация ограничена: используйте результат как вектор и обязательно сверяйте замеры.";

  const summary = `Распознана категория "${category}" (${fashion.normalized.source_category}). Рекомендуемый размер: ${main}, альтернативный: ${alt}. ${confidenceExplain}`;

  const verification = [
    `Сверьте ${riskZones.slice(0, 3).join(", ")} с таблицей замеров товара.`,
    "Проверьте отзывы с похожими параметрами роста/веса и fit intent.",
    "Сравните посадку с вещью-референсом, которая уже сидит хорошо.",
    inputs.product_url || inputs.product_title
      ? "Убедитесь, что указаны реальные габариты модели, а не только label-size."
      : "Добавьте ссылку/фото товара: это заметно повысит точность распознавания категории."
  ];

  const shiftFactors = [
    "Новая партия модели с отличием фактических замеров.",
    "Изменение подслоя (футболка/лонгслив/свитер) под верхний слой.",
    fashion.material_profile.shrink_risk === "high"
      ? "Возможная усадка после ухода для текущего состава."
      : "Низкая/умеренная усадка, но всё равно стоит проверять условия ухода.",
    fashion.normalized.known_brand
      ? "Даже в известном бренде крой конкретной модели может отличаться."
      : "Неизвестный бренд снижает надежность size-калибровки."
  ];

  const whatToAvoid = [
    "Покупка по label-size без сверки реальных замеров.",
    "Игнорирование состава ткани, плотности и эластичности.",
    fashion.normalized.source_category === "fallback"
      ? "Оплата без уточнения категории, если товар в ссылке описан слишком общо."
      : "Решение только по фото модели без учета собственных параметров."
  ];

  const alternatives =
    fashion.normalized.fit_intent === "oversize"
      ? [
          `Если нужен уверенный oversize — держите ${main}, но проверьте длину и рукав.`,
          `Если хотите ближе к regular, fallback — ${alt}.`,
          "Если модель заявлена как heavy/boxy, проверяйте плечи в первую очередь."
        ]
      : fashion.normalized.fit_intent === "figure"
        ? [
            `Основной вектор — ${main}. Если важна более плотная посадка, протестируйте ${alt}.`,
            "При прилегающем силуэте критичны грудь/талия и эластичность состава.",
            "Если сомневаетесь, выбирайте продавца с прозрачным возвратом."
          ]
        : [
            `Основной вектор — ${main}; альтернативный — ${alt}.`,
            "Если между размерами, ориентируйтесь на приоритетные зоны и состав.",
            "Для unknown brand оставляйте запас на ручную проверку замеров."
          ];

  return {
    summary,
    confidence_level: fashion.confidence_level,
    confidence_score: fashion.confidence_score,
    interpretation_notes: fashion.interpretation_notes,
    interpretation_limitations: fashion.limitations,
    primary_recommendation: `Ориентируйтесь на ${main} и подтверждайте выбор по зонам: ${riskZones.slice(0, 2).join(", ")}.`,
    alternatives,
    risks: [
      `Ключевые рисковые зоны: ${riskZones.join(", ")}.`,
      fashion.normalized.fit_intent === "oversize"
        ? "Риск перепутать regular-модель с oversize ожиданием."
        : "Риск промаха между regular/relaxed/figure-посадкой.",
      "Сдвиг посадки из-за material/composition факторов (плотность, эластичность, усадка)."
    ],
    reasoning: [
      `Категория: "${category}" (${fashion.normalized.source_category}), confidence=${fashion.confidence_level}.`,
      `Fit intent: ${fashion.normalized.fit_intent}, телосложение: ${fashion.normalized.body_shape}, профиль: ${fashion.normalized.gender_profile}.`,
      `Материал: density=${fashion.material_profile.density}, stretch=${fashion.material_profile.stretch}, structure=${fashion.material_profile.structure}, shrink=${fashion.material_profile.shrink_risk}.`
    ],
    action_steps: [
      "Сверьте приоритетные замеры в карточке товара.",
      "Сопоставьте эти зоны с вещью-референсом.",
      "Зафиксируйте основной/альтернативный размер перед покупкой.",
      "Проверьте факторы, которые могут сместить рекомендацию."
    ],
    what_to_verify: verification,
    what_to_avoid: whatToAvoid,
    simplified_variant: [
      `Быстрый вариант: ${main}.`,
      `Fallback: ${alt}.`,
      `Минимальная проверка: ${riskZones.slice(0, 2).join(" + ")}.`
    ],
    pdf_blocks: [
      { title: "Интерпретация входа", items: [summary, ...fashion.interpretation_notes] },
      { title: "Размерное решение", items: [`Основной: ${main}`, `Альтернативный: ${alt}`] },
      { title: "Material / Composition Layer", items: materialImpact },
      { title: "Проверка перед покупкой", items: verification }
    ],
    recognized_category: category,
    category_confidence: fashion.confidence_level,
    main_size: main,
    alt_size: alt,
    logic_of_choice:
      "Размер формируется из базового body-профиля/обычного размера, корректируется fit intent и затем фильтруется через material/composition риски.",
    key_risk_zones: riskZones,
    material_impact: materialImpact,
    pre_purchase_checks: verification,
    recommendation_shift_factors: shiftFactors
  };
}

export function runFashionPreview(inputs: Inputs, interpretation: unknown): PreviewModeOutput {
  const full = buildFull(inputs, interpretation);
  return {
    key_insight: `Категория: ${full.recognized_category}. Базовый размер: ${full.main_size}.`,
    main_risk: full.risks[0],
    next_step: full.pre_purchase_checks[0],
    preview_summary: "Показано около 20% ценности: ключевой вектор по размеру и один риск. Полная логика, альтернативы и проверки скрыты до оплаты.",
    confidence: full.confidence_level,
    interpretation_limitations: full.interpretation_limitations.slice(0, 2)
  };
}

export function runFashionPaywall(inputs: Inputs, interpretation: unknown): PaywallSummaryOutput {
  const full = buildFull(inputs, interpretation);
  return {
    product_name: "Полный разбор размера одежды",
    short_summary: `Определены категория "${full.recognized_category}" и размерный вектор ${full.main_size}/${full.alt_size}.`,
    value_bullets: [
      "Логика выбора размера с учетом fit intent и material/composition layer",
      "Ключевые зоны риска по посадке и как их проверять",
      "Факторы, которые могут сместить размерную рекомендацию",
      "PDF-версия результата + код доступа"
    ],
    unlock_outcome:
      "После оплаты откроется полный структурированный разбор: reasoning, альтернативы, verify/avoid блоки и PDF-ready версия.",
    confidence_note:
      full.confidence_level === "high"
        ? "Интерпретация уверенная: входные данные достаточны для персонализированного вектора."
        : full.confidence_level === "medium"
          ? "Интерпретация средняя: вектор рабочий, но часть факторов распознана косвенно."
          : "Интерпретация ограничена: полный разбор покажет, какие пробелы сильнее всего влияют на точность."
  };
}

export function runFashionFull(inputs: Inputs, interpretation: unknown): FashionFullResultOutput {
  return buildFull(inputs, interpretation);
}

export function runFashionPdf(inputs: Inputs, interpretation: unknown): PdfModeOutput {
  const full = buildFull(inputs, interpretation);
  return {
    title: "Fashion Size Report",
    summary: full.summary,
    sections: [
      ...full.pdf_blocks,
      { title: "Зоны риска", items: full.key_risk_zones },
      { title: "Что может сместить рекомендацию", items: full.recommendation_shift_factors }
    ],
    recommendations: full.action_steps,
    notes: [...full.what_to_verify, ...full.interpretation_limitations],
    disclaimer:
      "Результат носит аналитический характер. При неполных/неясных входных данных confidence снижается и требуется ручная проверка перед покупкой."
  };
}

export function runFashionFormHints(): FormHintsOutput {
  return {
    hints: {
      product_url: "Ссылка помогает распознать тип вещи и контекст бренда.",
      product_title: "Если ссылка неинформативна, название улучшит распознавание категории.",
      item_category: "Явная категория снижает риск ошибки между футболкой/худи/свитшотом.",
      brand: "Если бренд неизвестен, confidence будет ниже — это нормально.",
      gender_profile: "Профиль посадки (men/women/unisex) влияет на размерный вектор.",
      body_shape: "Телосложение помогает точнее оценить риск-зоны.",
      desired_fit: "Regular/relaxed/oversize/по фигуре напрямую меняет size-логику.",
      material_composition: "Состав ткани влияет на плотность, эластичность, жесткость и риск усадки.",
      fit_priority: "Выберите зоны, где важно попасть максимально точно.",
      good_fit_item: "Опишите вещь-референс, которая сидит хорошо.",
      fit_dislikes: "Что обычно не нравится в посадке — это снижает риск повторения ошибки.",
      good_fit_photo: "Фото вещи-референса усиливает image-aware интерпретацию.",
      item_photo: "Фото товара полезно, когда ссылка не дает явной категории."
    }
  };
}

export async function interpretFashionInput(inputs: Inputs): Promise<FashionInterpretation> {
  const baseline = interpretScenarioInputs("fashion", inputs) as FashionInterpretation;
  const runtime = getAiRuntimeConfig();
  if (!runtime.textLiveEnabled) return baseline;

  try {
    const promptInputs = sanitizeInputsForPrompt(inputs);
    const patch = await requestStructuredJson<FashionInterpretationPatch>({
      task: "fashion.interpretation",
      systemPrompt:
        "You refine fashion interpretation quality. Return only JSON patch with optional fields: interpretation_notes[], limitations[], confidence_score, confidence_level, recognized_category, source_category.",
      userPrompt: [
        "Improve interpretation only if data supports it. Never hallucinate missing facts.",
        `Inputs JSON: ${JSON.stringify(promptInputs)}`,
        `Baseline interpretation JSON: ${JSON.stringify(baseline)}`
      ].join("\n"),
      maxOutputTokens: 260,
      inputImages: extractImageInputs(inputs)
    });

    const merged: FashionInterpretation = {
      ...baseline,
      normalized: {
        ...baseline.normalized,
        recognized_category:
          typeof patch.recognized_category === "string" && patch.recognized_category.trim().length > 0
            ? patch.recognized_category
            : baseline.normalized.recognized_category,
        source_category: patch.source_category ?? baseline.normalized.source_category
      },
      interpretation_notes: hasStringArray(patch.interpretation_notes) ? patch.interpretation_notes : baseline.interpretation_notes,
      limitations: hasStringArray(patch.limitations) ? patch.limitations : baseline.limitations,
      confidence_score:
        typeof patch.confidence_score === "number" ? clampConfidence(patch.confidence_score) : baseline.confidence_score,
      confidence_level: patch.confidence_level ?? baseline.confidence_level
    };

    return merged;
  } catch {
    return baseline;
  }
}

export async function generateFashionPreview(
  inputs: Inputs,
  interpretation?: FashionInterpretation
): Promise<PreviewModeOutput> {
  const prepared = interpretation ?? (await interpretFashionInput(inputs));
  const baseline = runFashionPreview(inputs, prepared);
  const live = await tryLiveFashionOutput({
    mode: "preview",
    inputs,
    interpretation: prepared,
    baseline
  });
  return compactPreviewOutput(live ?? baseline);
}

export async function generateFashionPaywallSummary(
  inputs: Inputs,
  interpretation?: FashionInterpretation
): Promise<PaywallSummaryOutput> {
  const prepared = interpretation ?? (await interpretFashionInput(inputs));
  const baseline = runFashionPaywall(inputs, prepared);
  const live = await tryLiveFashionOutput({
    mode: "paywall_summary",
    inputs,
    interpretation: prepared,
    baseline
  });
  return compactPaywallSummary(live ?? baseline);
}

export async function generateFashionFullResult(
  inputs: Inputs,
  interpretation?: FashionInterpretation
): Promise<FashionFullResultOutput> {
  const prepared = interpretation ?? (await interpretFashionInput(inputs));
  const baseline = runFashionFull(inputs, prepared);
  const live = await tryLiveFashionOutput({
    mode: "full_result",
    inputs,
    interpretation: prepared,
    baseline
  });
  return compactFullOutput(live ?? baseline) as FashionFullResultOutput;
}

export async function generateFashionPdfPayload(
  inputs: Inputs,
  interpretation?: FashionInterpretation
): Promise<PdfModeOutput> {
  const prepared = interpretation ?? (await interpretFashionInput(inputs));
  const baseline = runFashionPdf(inputs, prepared);
  return compactPdfOutput(baseline);
}
