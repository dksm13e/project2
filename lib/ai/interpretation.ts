import type { AiScenarioDomain } from "@/lib/ai/outputSchemas";

type Inputs = Record<string, string>;

export type AiInputImage = {
  field: string;
  image_url: string;
  detail?: "low" | "high" | "auto";
};

export type ConfidenceLevel = "low" | "medium" | "high";

type ImageSignal = {
  field: string;
  source: "upload" | "url" | "none";
  tags: string[];
  quality: ConfidenceLevel;
  note: string;
};

export type FashionInterpretation = {
  domain: "fashion";
  normalized: {
    recognized_category: string;
    source_category: "explicit" | "inferred" | "fallback";
    gender_profile: string;
    body_shape: string;
    fit_intent: string;
    season: string;
    material_text: string;
    brand: string;
    known_brand: boolean;
    fit_priority: string[];
    height_cm: number | null;
    weight_kg: number | null;
    usual_size: string;
    product_text: string;
  };
  material_profile: {
    density: "light" | "medium" | "dense";
    stretch: "low" | "medium" | "high";
    structure: "soft" | "medium" | "firm";
    shrink_risk: "low" | "medium" | "high";
    notes: string[];
  };
  image_signals: ImageSignal[];
  confidence_score: number;
  confidence_level: ConfidenceLevel;
  limitations: string[];
  interpretation_notes: string[];
};

export type HomeInterpretation = {
  domain: "home";
  normalized: {
    room_type: string;
    room_area: number | null;
    room_shape: string;
    ceiling_height: string;
    goal: string;
    style: string;
    budget_rub: number | null;
    existing_items: string[];
    keep_items: string[];
    first_buy: string[];
    liked_materials: string[];
    liked_colors: string[];
    disliked_colors: string[];
    constraints: string[];
  };
  style_tags: string[];
  image_signals: ImageSignal[];
  confidence_score: number;
  confidence_level: ConfidenceLevel;
  limitations: string[];
  interpretation_notes: string[];
};

export type BeautyInterpretation = {
  domain: "beauty";
  normalized: {
    skin_type: string;
    concerns: string[];
    sensitivity: string;
    experience: string;
    desired_steps: string;
    routine_time: string;
    season: string;
    budget_rub: number | null;
    current_routine: string;
    failed_products: string;
    active_attitude: string;
    fragrance_free: string;
    reference_text: string;
  };
  product_roles: string[];
  routine_state: "underbuilt" | "balanced" | "overloaded";
  irritation_load: "low" | "medium" | "high";
  image_signals: ImageSignal[];
  confidence_score: number;
  confidence_level: ConfidenceLevel;
  limitations: string[];
  interpretation_notes: string[];
};

export type GuideInterpretation = {
  domain: "guide";
  confidence_score: number;
  confidence_level: ConfidenceLevel;
  limitations: string[];
  interpretation_notes: string[];
};

export type DomainInterpretation =
  | FashionInterpretation
  | HomeInterpretation
  | BeautyInterpretation
  | GuideInterpretation;

function parseNumber(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(",", ".").trim();
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[\n,;|]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeText(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function confidenceFromScore(score: number): ConfidenceLevel {
  if (score >= 80) return "high";
  if (score >= 55) return "medium";
  return "low";
}

function dedupe(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function isDataImageUrl(value: string): boolean {
  return /^data:image\/[a-z0-9.+-]+;base64,/i.test(value);
}

function isHttpImageUrl(value: string): boolean {
  if (!/^https?:\/\//i.test(value)) return false;
  return /(\.(png|jpe?g|webp|gif|avif|bmp|svg)(\?|#|$))|([/?&]image=)|([/?&]img=)/i.test(value);
}

function compactImageValue(value: string | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  if (isDataImageUrl(raw)) return "image-upload";
  if (raw.startsWith("upload:")) return "image-upload";
  return raw.length > 240 ? `${raw.slice(0, 240)}...` : raw;
}

export function sanitizeInputsForPrompt(inputs: Inputs): Inputs {
  const sanitized: Inputs = {};

  for (const [key, raw] of Object.entries(inputs)) {
    const value = (raw ?? "").trim();
    if (!value) {
      sanitized[key] = "";
      continue;
    }

    if (isDataImageUrl(value)) {
      const mime = value.slice(5, value.indexOf(";base64,") > -1 ? value.indexOf(";base64,") : undefined) || "image";
      const base64 = value.split(",", 2)[1] ?? "";
      const bytesApprox = Math.max(0, Math.floor((base64.length * 3) / 4));
      const kbApprox = Math.max(1, Math.round(bytesApprox / 1024));
      sanitized[key] = `[image:${mime};~${kbApprox}kb]`;
      continue;
    }

    sanitized[key] = value.length > 360 ? `${value.slice(0, 360)}...` : value;
  }

  return sanitized;
}

export function extractImageInputs(inputs: Inputs, maxImages = 4): AiInputImage[] {
  const images: AiInputImage[] = [];
  const fieldHintRe = /(photo|image|screenshot|room|interior|furniture|products|good_fit|item)/i;

  for (const [field, raw] of Object.entries(inputs)) {
    if (images.length >= maxImages) break;

    const value = (raw ?? "").trim();
    if (!value) continue;

    const isData = isDataImageUrl(value);
    const isHttp = isHttpImageUrl(value);
    if (!isData && !(fieldHintRe.test(field) && isHttp)) continue;

    images.push({
      field,
      image_url: value,
      detail: "auto"
    });
  }

  return images;
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, "");
}

function serializeTokens(value: string): string[] {
  return dedupe(
    value
      .toLowerCase()
      .replace(/https?:\/\//g, " ")
      .replace(/[^a-zA-Zа-яА-Я0-9]+/g, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2)
  );
}

function isLowInfoProductText(value: string): boolean {
  const tokens = serializeTokens(value);
  if (tokens.length < 2) return true;

  const generic = new Set(["model", "item", "product", "sale", "new", "арт", "sku"]);
  const genericOrNumericCount = tokens.filter((token) => generic.has(token) || /^\d+$/.test(token)).length;
  return genericOrNumericCount >= Math.ceil(tokens.length * 0.7);
}

function normalizeFashionCategory(raw: string | undefined): string {
  const value = normalizeKey(raw ?? "");
  const map: Record<string, string> = {
    tshirt: "футболка",
    tee: "футболка",
    футболка: "футболка",
    hoodie: "худи",
    худи: "худи",
    sweatshirt: "свитшот",
    свитшот: "свитшот",
    shirt: "рубашка",
    рубашка: "рубашка",
    jacket: "куртка",
    coat: "куртка",
    outerwear: "куртка",
    куртка: "куртка",
    vest: "жилет",
    жилет: "жилет",
    pants: "брюки",
    trousers: "брюки",
    брюки: "брюки",
    jeans: "джинсы",
    джинсы: "джинсы",
    shorts: "шорты",
    шорты: "шорты",
    dress: "платье",
    платье: "платье",
    skirt: "юбка",
    юбка: "юбка",
    shoes: "обувь",
    sneakers: "обувь",
    footwear: "обувь",
    обувь: "обувь",
    other: "other",
    другое: "other"
  };

  return map[value] ?? "";
}

type CategoryInference = {
  category: string | null;
  score: number;
  reason: string;
};

function inferCategoryFromTokens(tokens: string[]): CategoryInference {
  const joined = ` ${tokens.join(" ")} `;
  const has = (value: string) => joined.includes(` ${value} `);

  const checks: Array<{ category: string; score: number; reason: string; fn: () => boolean }> = [
    {
      category: "худи",
      score: 4,
      reason: "Есть сигналы hood/hoodie/капюшон.",
      fn: () =>
        tokens.some((token) => ["hoodie", "hooded", "худи", "капюшон", "капюш"].some((k) => token.includes(k)))
    },
    {
      category: "свитшот",
      score: 3,
      reason: "Есть сигналы sweatshirt/crewneck без явного hood.",
      fn: () =>
        tokens.some((token) => ["sweatshirt", "crewneck", "свитшот"].some((k) => token.includes(k))) &&
        !tokens.some((token) => ["hood", "hoodie", "капюш"].some((k) => token.includes(k)))
    },
    {
      category: "футболка",
      score: 3,
      reason: "Есть сигналы t-shirt/tee.",
      fn: () => tokens.some((token) => ["tshirt", "tee", "футболк"].some((k) => token.includes(k)))
    },
    {
      category: "куртка",
      score: 4,
      reason: "Есть сигналы верхнего слоя (jacket/coat/bomber/puffer).",
      fn: () => tokens.some((token) => ["jacket", "coat", "bomber", "puffer", "парка", "куртк"].some((k) => token.includes(k)))
    },
    {
      category: "рубашка",
      score: 3,
      reason: "Есть сигналы shirt/рубашка.",
      fn: () => tokens.some((token) => ["shirt", "рубашк"].some((k) => token.includes(k)))
    },
    {
      category: "джинсы",
      score: 3,
      reason: "Есть сигналы jeans/деним.",
      fn: () => tokens.some((token) => ["jeans", "деним", "джинс"].some((k) => token.includes(k)))
    },
    {
      category: "брюки",
      score: 3,
      reason: "Есть сигналы trousers/pants.",
      fn: () => tokens.some((token) => ["trousers", "pants", "брюк"].some((k) => token.includes(k)))
    },
    {
      category: "шорты",
      score: 3,
      reason: "Есть сигналы shorts.",
      fn: () => tokens.some((token) => ["shorts", "шорт"].some((k) => token.includes(k)))
    },
    {
      category: "платье",
      score: 3,
      reason: "Есть сигналы dress.",
      fn: () => tokens.some((token) => ["dress", "плать"].some((k) => token.includes(k)))
    },
    {
      category: "юбка",
      score: 3,
      reason: "Есть сигналы skirt.",
      fn: () => tokens.some((token) => ["skirt", "юбк"].some((k) => token.includes(k)))
    },
    {
      category: "обувь",
      score: 3,
      reason: "Есть сигналы shoes/sneakers.",
      fn: () => tokens.some((token) => ["shoes", "sneakers", "кроссовк", "обув"].some((k) => token.includes(k)))
    },
    {
      category: "жилет",
      score: 2,
      reason: "Есть сигналы vest.",
      fn: () => tokens.some((token) => ["vest", "жилет"].some((k) => token.includes(k)))
    }
  ];

  const hits = checks.filter((entry) => entry.fn());
  if (!hits.length) {
    return { category: null, score: 0, reason: "Явных сигналов категории не найдено." };
  }

  const sorted = hits.sort((a, b) => b.score - a.score);
  const top = sorted[0];

  if (top.category === "худи" && has("sweatshirt")) {
    return { category: "худи", score: 3, reason: "Есть смешанные сигналы hoodie/sweatshirt, выбран верхний слой с hood." };
  }

  return { category: top.category, score: top.score, reason: top.reason };
}

function normalizeFitPriority(rawValues: string[]): string[] {
  const aliases: Record<string, string> = {
    плечи: "плечи",
    shoulder: "плечи",
    shoulders: "плечи",
    грудь: "грудь",
    chest: "грудь",
    bust: "грудь",
    талия: "талия",
    waist: "талия",
    бедра: "бедра",
    бедро: "бедра",
    бёдра: "бедра",
    hips: "бедра",
    hip: "бедра",
    длина: "длина",
    length: "длина",
    рукав: "рукав",
    sleeve: "рукав",
    sleeves: "рукав",
    полнота: "полнота",
    width: "полнота"
  };

  return dedupe(
    rawValues
      .map((value) => aliases[normalizeKey(value)] ?? "")
      .filter(Boolean)
  );
}

function inferBeautyProductRoles(text: string): string[] {
  const tokens = serializeTokens(text);
  const roles: string[] = [];

  const roleRules: Array<{ role: string; keys: string[] }> = [
    { role: "cleanser", keys: ["cleanser", "foam", "гель", "пенка", "очищ"] },
    { role: "serum", keys: ["serum", "сыворот"] },
    { role: "cream", keys: ["cream", "крем", "moisturizer", "увлажн"] },
    { role: "spf", keys: ["spf", "sun", "солнц", "uv"] },
    { role: "exfoliant", keys: ["acid", "aha", "bha", "pha", "кислот", "peel", "пилинг"] },
    { role: "retinoid", keys: ["retinol", "retinal", "ретин", "adapalene"] },
    { role: "mask", keys: ["mask", "маска"] },
    { role: "support_step", keys: ["barrier", "ceramide", "церамид", "repair", "soothing", "успока"] }
  ];

  for (const rule of roleRules) {
    if (rule.keys.some((key) => tokens.some((token) => token.includes(key)))) {
      roles.push(rule.role);
    }
  }

  return dedupe(roles);
}

function parseImageSignal(field: string, raw: string | undefined): ImageSignal {
  const value = (raw ?? "").trim();
  if (!value) {
    return {
      field,
      source: "none",
      tags: [],
      quality: "low",
      note: "Изображение не добавлено"
    };
  }

  if (isDataImageUrl(value)) {
    return {
      field,
      source: "upload",
      tags: [field.replace(/_/g, "-"), "image-upload"],
      quality: "high",
      note: "Добавлено изображение для визуальной интерпретации"
    };
  }

  if (value.startsWith("upload:")) {
    const payload = value.replace("upload:", "");
    const tags = serializeTokens(payload);
    return {
      field,
      source: "upload",
      tags,
      quality: payload.includes("|") ? "high" : "medium",
      note: "Добавлен локальный файл для интерпретации контекста"
    };
  }

  const tags = serializeTokens(value);
  return {
    field,
    source: "url",
    tags,
    quality: value.startsWith("http") ? "medium" : "low",
    note: "Добавлена ссылка на изображение"
  };
}

function interpretFashion(inputs: Inputs): FashionInterpretation {
  const knownBrands = new Set([
    "nike",
    "adidas",
    "uniqlo",
    "zara",
    "hm",
    "h&m",
    "levi",
    "levis",
    "puma",
    "newbalance",
    "new balance",
    "reebok",
    "mango",
    "massimo",
    "cos"
  ]);

  const brandRaw = (inputs.brand ?? "").trim();
  const brandNormalized = normalizeText(brandRaw).replace(/\s+/g, "");
  const knownBrand = knownBrands.has(brandNormalized);

  const explicitCategory = normalizeFashionCategory(inputs.item_category);
  const productText = `${inputs.product_url ?? ""} ${inputs.product_title ?? ""} ${compactImageValue(inputs.item_photo)}`.trim();
  const categoryInference = inferCategoryFromTokens(serializeTokens(productText));

  const recognizedCategory =
    explicitCategory && explicitCategory !== "other"
      ? explicitCategory
      : categoryInference.category ?? (explicitCategory || "other");

  const sourceCategory: FashionInterpretation["normalized"]["source_category"] =
    explicitCategory && explicitCategory !== "other"
      ? "explicit"
      : categoryInference.category
        ? "inferred"
        : "fallback";

  const materialText = `${inputs.material_composition ?? ""} ${inputs.product_title ?? ""}`.trim();
  const materialTokens = serializeTokens(materialText);

  const stretch =
    materialTokens.some((token) => ["elastane", "spandex", "lycra", "эластан", "stretch"].includes(token))
      ? "high"
      : materialTokens.some((token) => ["knit", "трикотаж", "jersey"].includes(token))
        ? "medium"
        : "low";

  const density =
    materialTokens.some((token) => ["denim", "шерсть", "wool", "leather", "кожа", "heavy", "twill", "флис"].includes(token))
      ? "dense"
      : materialTokens.some((token) => ["cotton", "хлопок", "linen", "лен", "viscose", "вискоз"].includes(token))
        ? "medium"
        : "light";

  const structure =
    density === "dense"
      ? "firm"
      : materialTokens.some((token) => ["cotton", "хлопок", "linen", "лен"].includes(token))
        ? "medium"
        : "soft";

  const shrinkRisk =
    materialTokens.some((token) => ["cotton", "хлопок", "wool", "шерсть", "viscose", "вискоз"].includes(token)) &&
    stretch === "low"
      ? "high"
      : materialTokens.length > 0
        ? "medium"
        : "low";

  const imageSignals = [
    parseImageSignal("good_fit_photo", inputs.good_fit_photo),
    parseImageSignal("item_photo", inputs.item_photo)
  ];

  let confidenceScore = 82;
  const limitations: string[] = [];
  const interpretationNotes: string[] = [];

  if (!inputs.product_url && !inputs.product_title && !inputs.item_photo) {
    confidenceScore -= 18;
    limitations.push("Нет ссылки, названия или фото товара — категория определена с ограничениями.");
  }

  if (isLowInfoProductText(productText)) {
    confidenceScore -= 10;
    limitations.push("Описание товара слишком общее — тип вещи распознан с запасом неопределенности.");
  }

  if (sourceCategory === "explicit") {
    confidenceScore += 6;
  } else if (sourceCategory === "inferred") {
    confidenceScore -= categoryInference.score >= 3 ? 2 : 8;
    interpretationNotes.push(categoryInference.reason);
  } else {
    confidenceScore -= 16;
    limitations.push("Категория не распознана уверенно — использован fallback 'other'.");
  }

  if (!knownBrand && brandRaw) {
    confidenceScore -= 10;
    limitations.push("Бренд не распознан в базе ориентиров — confidence снижен.");
  }

  if (!brandRaw) {
    confidenceScore -= 6;
    limitations.push("Бренд не указан — меньше ориентиров по размерной сетке.");
  }

  if (!materialText) {
    confidenceScore -= 8;
    limitations.push("Состав ткани не указан — material/composition слой ограничен.");
  } else {
    confidenceScore += 3;
  }

  if (!inputs.height_cm || !inputs.weight_kg) {
    if (!inputs.usual_size) {
      confidenceScore -= 14;
      limitations.push("Нет роста/веса и обычного размера — базовый размер оценен с запасом.");
    } else {
      confidenceScore -= 7;
      limitations.push("Нет части антропометрии — опора смещена на обычный размер.");
    }
  }

  if (inputs.desired_fit) {
    confidenceScore += 2;
  }

  const hasImageContext = imageSignals.some((signal) => signal.source !== "none");
  if (hasImageContext) {
    confidenceScore += 4;
    interpretationNotes.push("Изображения использованы как дополнительный контекст по фасону и категории.");
  }

  confidenceScore = clamp(confidenceScore, 24, 97);

  const fitPriority = normalizeFitPriority(splitList(inputs.fit_priority));

  return {
    domain: "fashion",
    normalized: {
      recognized_category: recognizedCategory,
      source_category: sourceCategory,
      gender_profile: inputs.gender_profile || "unisex",
      body_shape: inputs.body_shape || "regular",
      fit_intent: inputs.desired_fit || "regular",
      season: inputs.season || "all-season",
      material_text: materialText || "not-provided",
      brand: brandRaw || "unknown-brand",
      known_brand: knownBrand,
      fit_priority: fitPriority,
      height_cm: parseNumber(inputs.height_cm),
      weight_kg: parseNumber(inputs.weight_kg),
      usual_size: (inputs.usual_size || "").trim(),
      product_text: productText
    },
    material_profile: {
      density,
      stretch,
      structure,
      shrink_risk: shrinkRisk,
      notes: [
        stretch === "high"
          ? "Высокая эластичность повышает адаптивность, но может скрывать ошибки по длине/рукаву."
          : stretch === "medium"
            ? "Умеренная эластичность допускает небольшой запас в одной зоне."
            : "Низкая эластичность требует точной проверки ключевых замеров.",
        density === "dense"
          ? "Плотный материал чувствителен к ошибке по плечам/груди и хуже прощает промах."
          : density === "medium"
            ? "Средняя плотность стабильна при регулярной посадке."
            : "Легкий материал сильнее зависит от кроя и подкладочного слоя.",
        shrinkRisk === "high"
          ? "Риск усадки высокий — учитывайте запас или условия ухода."
          : "Риск усадки умеренный/низкий по текущим признакам."
      ]
    },
    image_signals: imageSignals,
    confidence_score: confidenceScore,
    confidence_level: confidenceFromScore(confidenceScore),
    limitations,
    interpretation_notes: interpretationNotes
  };
}

function normalizeHomeStyle(raw: string | undefined): string {
  return (raw || "minimalism").trim().toLowerCase();
}

function inferStyleTagsFromImages(signals: ImageSignal[]): string[] {
  const tags = signals.flatMap((signal) => signal.tags);
  const joined = tags.join(" ");
  const has = (value: string) => joined.includes(value);

  const styleTags: string[] = [];
  if (has("japandi")) styleTags.push("japandi");
  if (has("scandi")) styleTags.push("scandi");
  if (has("loft")) styleTags.push("soft-loft");
  if (has("luxury")) styleTags.push("quiet-luxury-light");
  if (has("minimal")) styleTags.push("minimalism");
  if (has("organic")) styleTags.push("modern-organic");
  if (has("hotel")) styleTags.push("hotel-like-calm");
  return dedupe(styleTags);
}

function interpretHome(inputs: Inputs): HomeInterpretation {
  const roomArea = parseNumber(inputs.room_area ?? inputs.room_area_m2);
  const budget = parseNumber(inputs.budget_rub);
  const style = normalizeHomeStyle(inputs.style);
  const goal = (inputs.main_goal || inputs.goal || "cozy").trim().toLowerCase();

  const likedMaterials = splitList(inputs.liked_materials);
  const likedColors = splitList(inputs.liked_colors);
  const dislikedColors = splitList(inputs.disliked_colors);
  const existingItems = splitList(inputs.existing_items);
  const keepItems = splitList(inputs.must_keep);
  const firstBuy = splitList(inputs.first_priority_buy ?? inputs.buy_first);

  const imageSignals = [
    parseImageSignal("room_photo", inputs.room_photo),
    parseImageSignal("reference_interior_photo", inputs.reference_interior_photo ?? inputs.inspiration_photo),
    parseImageSignal("existing_furniture_photo", inputs.existing_furniture_photo ?? inputs.current_furniture_photo)
  ];

  const imageStyleTags = inferStyleTagsFromImages(imageSignals);
  const styleTags = dedupe(
    [
      style,
      ...imageStyleTags,
      goal.includes("luxury") ? "premium-calm" : "",
      goal.includes("storage") ? "storage-focused" : "",
      goal.includes("workspace") ? "work-zone" : "",
      likedMaterials.length ? "material-directed" : "",
      likedColors.length ? "color-directed" : "",
      keepItems.length ? "anchor-existing-items" : ""
    ].filter(Boolean)
  );

  const constraints: string[] = [];
  if (inputs.kids_pets && inputs.kids_pets !== "none") constraints.push("kids-or-pets");
  if (inputs.rental_constraints === "yes") constraints.push("rental");
  if ((inputs.room_shape || "").toLowerCase() === "narrow") constraints.push("narrow-layout");
  if ((inputs.ceiling_height || "").toLowerCase() === "low") constraints.push("low-ceiling");

  let confidenceScore = 84;
  const limitations: string[] = [];
  const interpretationNotes: string[] = [];

  if (!inputs.room_type) {
    confidenceScore -= 8;
    limitations.push("Тип комнаты не указан — must-have собран по универсальному профилю.");
  }

  if (!roomArea) {
    confidenceScore -= 12;
    limitations.push("Площадь не указана — масштаб предметов рассчитан ориентировочно.");
  }

  if (!inputs.room_shape) {
    confidenceScore -= 8;
    limitations.push("Форма комнаты не указана — композиция без геометрической калибровки.");
  }

  if (!budget) {
    confidenceScore -= 10;
    limitations.push("Бюджет не указан — приоритеты выставлены без точного финансового вектора.");
  }

  if (!inputs.style) {
    confidenceScore -= 8;
    limitations.push("Стиль не указан — визуальная стратегия собрана из цели и общих сигналов.");
  }

  if (!inputs.main_goal && !inputs.goal) {
    confidenceScore -= 6;
    limitations.push("Цель не указана — баланс функциональности и атмосферы задан консервативно.");
  }

  if (imageSignals.every((signal) => signal.source === "none")) {
    confidenceScore -= 8;
    limitations.push("Нет фото комнаты/референсов — image-aware слой не задействован.");
  } else {
    confidenceScore += 5;
    interpretationNotes.push("Фото-контекст учтен через style tags, материал и ограничения по масштабу.");
  }

  if (firstBuy.length) confidenceScore += 2;
  if (keepItems.length || existingItems.length) confidenceScore += 2;
  if (likedMaterials.length || likedColors.length || dislikedColors.length) confidenceScore += 2;

  if (constraints.includes("rental")) {
    interpretationNotes.push("Включен rental-friendly режим: меньше необратимых решений.");
  }

  confidenceScore = clamp(confidenceScore, 24, 98);

  return {
    domain: "home",
    normalized: {
      room_type: inputs.room_type || "living",
      room_area: roomArea,
      room_shape: inputs.room_shape || "standard",
      ceiling_height: inputs.ceiling_height || "standard",
      goal,
      style,
      budget_rub: budget,
      existing_items: existingItems,
      keep_items: keepItems,
      first_buy: firstBuy,
      liked_materials: likedMaterials,
      liked_colors: likedColors,
      disliked_colors: dislikedColors,
      constraints
    },
    style_tags: styleTags,
    image_signals: imageSignals,
    confidence_score: confidenceScore,
    confidence_level: confidenceFromScore(confidenceScore),
    limitations,
    interpretation_notes: interpretationNotes
  };
}

function mapConcernAliases(raw: string[]): string[] {
  const aliases: Record<string, string> = {
    dehydration: "dehydration",
    обезвоженность: "dehydration",
    redness: "redness",
    покраснение: "redness",
    acne: "acne",
    акне: "acne",
    postacne: "post-acne",
    "post-acne": "post-acne",
    постакне: "post-acne",
    dullness: "dullness",
    тусклость: "dullness",
    uneventone: "uneven-tone",
    uneventonee: "uneven-tone",
    "uneven-tone": "uneven-tone",
    неровныйтон: "uneven-tone",
    wrinkles: "wrinkles",
    морщины: "wrinkles",
    reactivity: "reactivity",
    реактивность: "reactivity",
    barrier: "barrier",
    барьер: "barrier",
    барьернарушен: "barrier"
  };

  return dedupe(
    raw
      .map((item) => aliases[normalizeKey(item)] ?? "")
      .filter(Boolean)
  );
}

function interpretBeauty(inputs: Inputs): BeautyInterpretation {
  const concerns = mapConcernAliases(splitList(inputs.concerns));
  const referenceText = `${inputs.reference_url ?? ""} ${inputs.product_url ?? ""} ${compactImageValue(
    inputs.current_products_photo ?? inputs.products_photo
  )} ${
    inputs.current_routine ?? ""
  } ${inputs.not_suitable_products ?? ""}`.trim();

  const productRoles = inferBeautyProductRoles(referenceText);
  const imageSignals = [parseImageSignal("current_products_photo", inputs.current_products_photo ?? inputs.products_photo)];
  const currentRoutineTokens = splitList(inputs.current_routine);

  let routineState: BeautyInterpretation["routine_state"] = "balanced";
  if (
    (productRoles.includes("retinoid") && productRoles.includes("exfoliant")) ||
    currentRoutineTokens.length >= 7
  ) {
    routineState = "overloaded";
  } else if (!productRoles.includes("cleanser") || !productRoles.includes("spf")) {
    routineState = "underbuilt";
  }

  let irritationLoad: BeautyInterpretation["irritation_load"] = "low";
  if (
    routineState === "overloaded" ||
    (inputs.sensitivity_level === "high" &&
      (productRoles.includes("retinoid") || productRoles.includes("exfoliant")))
  ) {
    irritationLoad = "high";
  } else if (productRoles.includes("retinoid") || productRoles.includes("exfoliant")) {
    irritationLoad = "medium";
  }

  let confidenceScore = 83;
  const limitations: string[] = [];
  const interpretationNotes: string[] = [];

  if (!inputs.skin_type) {
    confidenceScore -= 10;
    limitations.push("Тип кожи не указан — рекомендации калиброваны по безопасному базовому режиму.");
  }

  if (!concerns.length) {
    confidenceScore -= 8;
    limitations.push("Concerns не заданы — фокус routine выбран по общему профилю.");
  }

  if (!inputs.sensitivity_level) {
    confidenceScore -= 10;
    limitations.push("Чувствительность не указана — интенсивность ограничена консервативно.");
  }

  if (!inputs.experience_level) {
    confidenceScore -= 6;
    limitations.push("Уровень опыта не указан — скорость внедрения задана с запасом.");
  }

  if (!inputs.current_routine) {
    confidenceScore -= 6;
    limitations.push("Текущий уход не описан — сложнее убрать дубли и конфликты.");
  }

  if (!inputs.reference_url && !inputs.product_url && !inputs.current_products_photo) {
    confidenceScore -= 6;
    limitations.push("Нет ссылки/фото продуктов — роль формул распознана частично.");
  }

  if (imageSignals.some((signal) => signal.source !== "none")) {
    confidenceScore += 4;
    interpretationNotes.push("Фото текущих продуктов использовано как контекст по ролям шагов.");
  }

  if (routineState === "overloaded") {
    confidenceScore -= 5;
    interpretationNotes.push("Обнаружен риск перегруза активами — стратегия будет более мягкой.");
  }
  if (routineState === "underbuilt") {
    interpretationNotes.push("Текущий набор выглядит недособранным — фокус смещен на базовые обязательные шаги.");
  }

  confidenceScore = clamp(confidenceScore, 24, 98);

  return {
    domain: "beauty",
    normalized: {
      skin_type: inputs.skin_type || "sensitive",
      concerns,
      sensitivity: inputs.sensitivity_level || "high",
      experience: inputs.experience_level || "beginner",
      desired_steps: inputs.desired_steps || "3-4",
      routine_time: inputs.routine_time || "both",
      season: inputs.season || "all-season",
      budget_rub: parseNumber(inputs.budget_rub),
      current_routine: inputs.current_routine || "",
      failed_products: inputs.not_suitable_products || "",
      active_attitude: inputs.active_attitude || "not_sure",
      fragrance_free: inputs.fragrance_free || "not_important",
      reference_text: referenceText
    },
    product_roles: productRoles,
    routine_state: routineState,
    irritation_load: irritationLoad,
    image_signals: imageSignals,
    confidence_score: confidenceScore,
    confidence_level: confidenceFromScore(confidenceScore),
    limitations,
    interpretation_notes: interpretationNotes
  };
}

export function interpretScenarioInputs(domain: AiScenarioDomain, inputs: Inputs): DomainInterpretation {
  if (domain === "fashion") return interpretFashion(inputs);
  if (domain === "home") return interpretHome(inputs);
  if (domain === "beauty") return interpretBeauty(inputs);
  return {
    domain: "guide",
    confidence_score: 100,
    confidence_level: "high",
    limitations: [],
    interpretation_notes: ["Guide mode uses static navigation anchors."]
  };
}
