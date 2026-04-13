import type {
  FashionFullResultOutput,
  FormHintsOutput,
  PaywallSummaryOutput,
  PdfModeOutput,
  PreviewModeOutput
} from "@/lib/ai/outputSchemas";

type Inputs = Record<string, string>;

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

function normalizeSize(value: string | undefined): string {
  const raw = (value ?? "").trim().toUpperCase();
  if (!raw) return "M";
  if (SIZE_ORDER.includes(raw)) return raw;
  if (["44", "46", "48"].includes(raw)) return "M";
  if (["50", "52"].includes(raw)) return "L";
  return raw;
}

function pickAltSize(main: string, fit: string): string {
  const idx = SIZE_ORDER.indexOf(main);
  if (idx === -1) return fit === "slim" ? `${main} (на размер больше)` : `${main} (на размер меньше)`;

  if (fit === "slim") {
    return SIZE_ORDER[Math.min(idx + 1, SIZE_ORDER.length - 1)];
  }
  if (fit === "relaxed") {
    return SIZE_ORDER[Math.max(idx - 1, 0)];
  }
  return SIZE_ORDER[Math.min(idx + 1, SIZE_ORDER.length - 1)];
}

function riskLevel(fit: string, hasBrand: boolean): "low" | "medium" | "high" {
  if (fit === "slim") return "high";
  if (fit === "relaxed" && hasBrand) return "low";
  return "medium";
}

function buildFull(inputs: Inputs): FashionFullResultOutput {
  const fit = inputs.fit_preference ?? "regular";
  const main = normalizeSize(inputs.usual_size);
  const alt = pickAltSize(main, fit);
  const hasBrand = Boolean(inputs.trusted_brand?.trim());
  const level = riskLevel(fit, hasBrand);

  return {
    main_size: main,
    alt_size: alt,
    fit_summary:
      fit === "slim"
        ? "Выбран более плотный fit, поэтому критичны замеры плеч и груди."
        : fit === "relaxed"
          ? "Выбран свободный fit, можно оставить запас по груди и длине."
          : "Стандартный fit: оптимально сравнить базовые замеры с привычной вещью.",
    risk_level: level,
    risks: [
      "Несовпадение по плечам и длине рукава.",
      "Разброс фактических замеров у разных партий.",
      "Ориентация только на label-size без таблицы."
    ],
    advice: [
      "Сравните плечи, грудь и рукав с вашей вещью, которая сидит хорошо.",
      "Проверьте 2-3 отзыва с похожими параметрами.",
      "Если ключевого замера нет в карточке, отложите покупку.",
      "При сомнениях выбирайте вариант с более удобным возвратом."
    ],
    short_conclusion: `Базовый выбор: ${main}. Запасной вариант: ${alt}.`,
    logic_explanation:
      "Логика строится от fit-предпочтения, привычного размера и рисков по ключевым замерам, а не от одного ярлыка.",
    important_considerations: [
      "Учитывайте слой одежды под вещью.",
      "Перед оплатой проверьте условия возврата.",
      "Не принимайте решение только по фото на модели."
    ]
  };
}

export function runFashionPreview(inputs: Inputs): PreviewModeOutput {
  const full = buildFull(inputs);
  return {
    key_insight: `Вероятный размер: ${full.main_size}.`,
    main_risk: full.risks[0],
    next_step: "Проверьте плечи и длину рукава в таблице размеров.",
    preview_summary: "Направление по размеру определено, но детали посадки скрыты до оплаты."
  };
}

export function runFashionPaywall(inputs: Inputs): PaywallSummaryOutput {
  const full = buildFull(inputs);
  return {
    product_name: "Полный разбор размера одежды",
    short_summary: `Предварительно определен размер ${full.main_size}, но для безопасной покупки нужен полный разбор.`,
    value_bullets: [
      "Основной и альтернативный размер",
      "Разбор посадки под ваш fit",
      "Список рисков и что проверить перед оплатой товара",
      "Пошаговые рекомендации по выбору"
    ],
    unlock_outcome: "После оплаты вы получите полный разбор, PDF и код доступа."
  };
}

export function runFashionFull(inputs: Inputs): FashionFullResultOutput {
  return buildFull(inputs);
}

export function runFashionPdf(inputs: Inputs): PdfModeOutput {
  const full = buildFull(inputs);
  return {
    title: "Разбор размера одежды",
    summary: full.logic_explanation,
    sections: [
      { title: "Размер", items: [`Основной: ${full.main_size}`, `Альтернативный: ${full.alt_size}`] },
      { title: "Посадка", items: [full.fit_summary] },
      { title: "Риски", items: full.risks }
    ],
    recommendations: full.advice,
    notes: full.important_considerations,
    disclaimer: "Разбор носит информационный характер и не гарантирует итоговую посадку."
  };
}

export function runFashionFormHints(): FormHintsOutput {
  return {
    hints: {
      product_url: "Ссылка помогает учесть таблицу размеров и тип кроя.",
      item_type: "Категория влияет на риски по посадке.",
      height_cm: "Рост нужен, чтобы точнее оценить длину рукава и изделия.",
      weight_kg: "Вес помогает уточнить базовый размерный диапазон.",
      fit_preference: "От fit зависит, нужен ли запас или более плотная посадка.",
      usual_size: "Если не уверены, укажите размер вещи, которая сидит комфортно.",
      trusted_brand: "Укажите бренд, который обычно сидит хорошо, для калибровки."
    }
  };
}

