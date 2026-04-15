"use client";

import type { ScenarioId } from "@/lib/scenarios";
import { getScenario } from "@/lib/scenarios";

const DRAFTS_KEY = "assistant_drafts_v1";
const RESULTS_KEY = "assistant_results_v1";
const CODE_INDEX_KEY = "assistant_code_index_v1";

export type ScenarioDraft = {
  id: string;
  scenarioId: ScenarioId;
  createdAt: string;
  inputs: Record<string, string>;
};

export type WeakPreview = {
  signal: string;
  risk: string;
  nextStep: string;
  lockedModules: string[];
};

export type PurchasedResult = {
  token: string;
  accessCode: string;
  scenarioId: ScenarioId;
  draftId: string;
  createdAt: string;
  confidenceBand: string;
  executiveSummary: string;
  coreDecision: string;
  whyThis: string[];
  alternatives: string[];
  cautionFlags: string[];
  actionPlan: string[];
};

type StoredMap<T> = Record<string, T>;

const demoResult: PurchasedResult = {
  token: "demo-token",
  accessCode: "ASST-DEMO-2026",
  scenarioId: "fashion-size",
  draftId: "demo-draft",
  createdAt: new Date("2026-04-01T10:00:00.000Z").toISOString(),
  confidenceBand: "74/100",
  executiveSummary:
    "Направление по посадке в целом позитивное, но по плечам и рукаву есть узкая зона допуска в одном из размеров.",
  coreDecision: "Покупайте только если мерки плеч и рукава совпадают с вашей базой с отклонением не более 2 см.",
  whyThis: [
    "Параметры тела и крой показывают чувствительность в верхней части.",
    "По фото видно более узкую геометрию плеч у изделия.",
    "По отзывам для этого типа вещей часто встречается обмен из-за длины рукава."
  ],
  alternatives: [
    "Попробуйте соседний размер со стандартной посадкой.",
    "Выберите похожую вещь с более свободной линией плеч.",
    "Если сомневаетесь, выбирайте продавца с удобным возвратом."
  ],
  cautionFlags: [
    "Не опирайтесь только на буквенный размер без мерок изделия.",
    "Не принимайте решение по фото, если важна посадка по швам.",
    "Не покупайте сразу, если планируете многослойность и она меняет посадку в плечах."
  ],
  actionPlan: [
    "Откройте таблицу товара и сравните плечи, грудь и рукав.",
    "Проверьте 2 недавних отзыва с похожими параметрами тела.",
    "Фиксируйте размер только после проверки всех трёх мерок."
  ]
};

function readMap<T>(key: string): StoredMap<T> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(key);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as StoredMap<T>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function writeMap<T>(key: string, value: StoredMap<T>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function makeId(prefix: string): string {
  const base = Math.random().toString(36).slice(2, 10);
  const stamp = Date.now().toString(36);
  return `${prefix}_${base}${stamp.slice(-4)}`;
}

function makeAccessCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segment = (len: number) =>
    Array.from({ length: len }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");

  return `ASST-${segment(4)}-${segment(4)}`;
}

function pick(inputs: Record<string, string>, keys: string[], fallback: string): string {
  for (const key of keys) {
    const value = inputs[key]?.trim();
    if (value) return value;
  }
  return fallback;
}

function buildWeakPreview(draft: ScenarioDraft): WeakPreview {
  const { scenarioId, inputs } = draft;

  if (scenarioId === "fashion-size") {
    const itemType = pick(inputs, ["item_category", "item_type"], "выбранная вещь");
    const fit = pick(inputs, ["desired_fit", "fit_preference"], "стандартная посадка");

    return {
      signal: `Для категории «${itemType}» наиболее вероятна посадка, близкая к формату «${fit}».`,
      risk: "Есть риск ошибки по плечам и рукаву, поэтому один шаг в размере может быть критичным.",
      nextStep: "Сверьте мерки плеч и рукава до оплаты.",
      lockedModules: [
        "Точная карта выбора размера",
        "Альтернативные сценарии посадки",
        "Оценка риска возврата по условиям",
        "PDF-версия результата"
      ]
    };
  }

  if (scenarioId === "fashion-fit-check") {
    const styleGoal = pick(inputs, ["style_goal"], "ваш стиль");

    return {
      signal: `Совместимость с целью «${styleGoal}» средняя: вещь может вписаться, но не автоматически.`,
      risk: "Силуэт вещи может спорить с вашим привычным балансом образа.",
      nextStep: "Проверьте, как крой вещи сочетается с вашими базовыми комбинациями.",
      lockedModules: [
        "Варианты сочетаний по ситуациям",
        "Точки риска и что может выбиваться по стилю",
        "Понятная схема «брать или не брать»",
        "PDF-версия результата"
      ]
    };
  }

  if (scenarioId === "home-room-set") {
    const roomType = pick(inputs, ["room_type"], "room");

    return {
      signal: `По комнате «${roomType}» базовый вектор выглядит цельным, но по бюджету есть напряжение.`,
      risk: "Есть риск перегруза одной ключевой покупкой и потери баланса набора.",
      nextStep: "Сначала зафиксируйте один базовый элемент и перераспределите второстепенные покупки.",
      lockedModules: [
        "Полная карта композиции комнаты",
        "Распределение бюджета по категориям",
        "Альтернативы по приоритетам",
        "PDF-версия результата"
      ]
    };
  }

  return {
    signal: "Базовая схема ухода возможна, но порядок и частота шагов пока требуют уточнения.",
    risk: "Если перепутать порядок активных шагов, можно перегрузить кожу.",
    nextStep: "Сначала зафиксируйте безопасную последовательность и только потом добавляйте новые средства.",
    lockedModules: [
      "Подробная схема на утро и вечер",
      "Матрица несовместимых сочетаний",
      "Замены по приоритету и бюджету",
      "PDF-версия результата"
    ]
  };
}

type ResultBlueprint = Omit<PurchasedResult, "token" | "accessCode" | "draftId" | "createdAt">;

function buildFullResult(draft: ScenarioDraft): ResultBlueprint {
  const { scenarioId, inputs } = draft;

  if (scenarioId === "fashion-size") {
    const height = pick(inputs, ["height_cm"], "n/a");
    const weight = pick(inputs, ["weight_kg"], "n/a");
    const fit = pick(inputs, ["fit_preference"], "regular");

    return {
      scenarioId,
      confidenceBand: "77/100",
      executiveSummary: "Посадка будет комфортной, если выбрать ветку размера с запасом по плечам и рукаву.",
      coreDecision: `Ориентируйтесь на посадку «${fit}» и сверяйте мерки с базой ${height} см / ${weight} кг.`,
      whyThis: [
        "Профиль ввода показывает среднюю чувствительность к посадке в верхней части.",
        "Категория вещи и желаемая посадка в целом совместимы.",
        "Риск сосредоточен в одной зоне, поэтому точечная проверка сильно повышает надёжность."
      ],
      alternatives: [
        "Возьмите соседний размер с более ровным силуэтом.",
        "Выберите вариант с запасом эластичности в ключевых швах.",
        "Отложите покупку, если в карточке нет мерок плеч или рукава."
      ],
      cautionFlags: [
        "Не опирайтесь только на буквенный размер без мерок изделия.",
        "Не переходите к оплате, если не хватает хотя бы одной ключевой мерки.",
        "Учитывайте слой одежды под низ, если планируете многослойность."
      ],
      actionPlan: [
        "Сверьте три зоны: плечи, грудь, рукав.",
        "Проверьте два отзыва с параметрами, близкими к вашим.",
        "Финализируйте покупку только когда все размеры в допустимом диапазоне."
      ]
    };
  }

  if (scenarioId === "fashion-fit-check") {
    const goal = pick(inputs, ["style_goal"], "style goal");

    return {
      scenarioId,
      confidenceBand: "71/100",
      executiveSummary: "Вещь может вписаться в образ, но ей нужна более точная поддержка по сочетаниям.",
      coreDecision: `Берите вещь только если текущие комбинации поддерживают цель «${goal}».`,
      whyThis: [
        "Силуэт не совпадает с целью автоматически и требует проверки в комплекте.",
        "Контраст объёма вещи и ваших пропорций создаёт условный риск.",
        "Итог сильно зависит от того, с чем вы её носите."
      ],
      alternatives: [
        "Сместитесь к более чистому силуэту с меньшей зависимостью от сочетаний.",
        "Оставьте вещь, но замените пропорцию низа.",
        "Выберите более спокойный вариант для повседневного сценария."
      ],
      cautionFlags: [
        "Не оценивайте сочетание только по фото спереди.",
        "Не комбинируйте сразу с такими же доминирующими акцентами.",
        "Откажитесь от покупки, если комфорт уже на границе."
      ],
      actionPlan: [
        "Проверьте пропорции в зеркале с той обувью, с которой планируете носить.",
        "Оцените образ в профиль перед финальным решением.",
        "Берите только если и комфорт, и визуальная логика стабильны."
      ]
    };
  }

  if (scenarioId === "home-room-set") {
    const budget = pick(inputs, ["budget_rub"], "your budget");
    const roomType = pick(inputs, ["room_type"], "room");

    return {
      scenarioId,
      confidenceBand: "79/100",
      executiveSummary: "Направление по комнате будет сильнее, если сначала вложиться в базовые элементы.",
      coreDecision: `Для комнаты «${roomType}» держите общий бюджет около ${budget} и распределяйте покупки по этапам.`,
      whyThis: [
        "Основной стиль читается стабильно по выбранным предпочтениям.",
        "Текущий план рискует перегрузить второстепенные покупки.",
        "Покупка по этапам делает интерьер и бюджет устойчивее."
      ],
      alternatives: [
        "Сделайте один ключевой акцент и 2 поддерживающие позиции среднего уровня.",
        "Перенесите аксессуары на второй этап, а не в первую неделю.",
        "Замените один акцентный предмет на модульное хранение для баланса."
      ],
      cautionFlags: [
        "Не фиксируйте декор до выбора геометрически важных предметов.",
        "Не смешивайте тёплые и холодные подтоны без переходного элемента.",
        "Избегайте слишком крупных акцентов в узких проходах."
      ],
      actionPlan: [
        "Выберите базовый якорный предмет и проверьте проходы.",
        "Разложите бюджет по категориям до выбора конкретных позиций.",
        "Финализируйте декор только после решения базовой геометрии."
      ]
    };
  }

  const skinType = pick(inputs, ["skin_type"], "your skin type");
  const goal = pick(inputs, ["main_goal"], "your primary goal");

  return {
    scenarioId,
    confidenceBand: "73/100",
    executiveSummary:
      "Упрощённая схема ухода даст более стабильный результат, если новые шаги вводить постепенно и в правильном порядке.",
    coreDecision: `Стройте уход вокруг цели «${goal}» в режиме, безопасном для типа кожи «${skinType}».`,
    whyThis: [
      "Цель достижима, но риск конфликта зависит от последовательности шагов.",
      "Снижение количества активных шагов одновременно повышает переносимость.",
      "Бюджета достаточно для спокойной и рабочей схемы без лишних средств."
    ],
    alternatives: [
      "Сначала используйте двухшаговый цикл и только потом расширяйте схему.",
      "На этапе адаптации заменяйте один активный шаг на восстановление барьера.",
      "При росте чувствительности переходите на неделю щадящего режима."
    ],
    cautionFlags: [
      "Не наслаивайте сильные активные шаги в одном периоде ввода.",
      "Не увеличивайте частоту до стабильной реакции кожи.",
      "Не воспринимайте этот разбор как медицинское назначение."
    ],
    actionPlan: [
      "Соберите базу на утро и вечер на 7 дней.",
      "Добавьте один новый шаг и наблюдайте реакцию.",
      "Расширяйте схему только после стабильной недели."
    ]
  };
}

export function saveDraft(scenarioId: ScenarioId, inputs: Record<string, string>): ScenarioDraft {
  const draft: ScenarioDraft = {
    id: makeId("draft"),
    scenarioId,
    createdAt: new Date().toISOString(),
    inputs
  };

  const drafts = readMap<ScenarioDraft>(DRAFTS_KEY);
  drafts[draft.id] = draft;
  writeMap(DRAFTS_KEY, drafts);

  return draft;
}

export function getDraftById(draftId: string | null | undefined): ScenarioDraft | null {
  if (!draftId) return null;
  const drafts = readMap<ScenarioDraft>(DRAFTS_KEY);
  return drafts[draftId] ?? null;
}

export function getWeakPreviewForDraft(draftId: string | null | undefined): (WeakPreview & { draft: ScenarioDraft }) | null {
  const draft = getDraftById(draftId);
  if (!draft) return null;
  return { ...buildWeakPreview(draft), draft };
}

export function createPurchasedResult(draft: ScenarioDraft): PurchasedResult {
  const token = makeId("result");
  const accessCode = makeAccessCode();
  const result: PurchasedResult = {
    ...buildFullResult(draft),
    token,
    accessCode,
    draftId: draft.id,
    createdAt: new Date().toISOString()
  };

  const resultMap = readMap<PurchasedResult>(RESULTS_KEY);
  resultMap[token] = result;
  writeMap(RESULTS_KEY, resultMap);

  const codeMap = readMap<string>(CODE_INDEX_KEY);
  codeMap[accessCode] = token;
  writeMap(CODE_INDEX_KEY, codeMap);

  return result;
}

export function getPurchasedResultByToken(token: string | null | undefined): PurchasedResult | null {
  if (!token) return null;
  if (token === demoResult.token) return demoResult;

  const resultMap = readMap<PurchasedResult>(RESULTS_KEY);
  return resultMap[token] ?? null;
}

export function normalizeAccessCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function restoreCodeFormat(normalized: string): string {
  if (!normalized.startsWith("ASST") || normalized.length < 12) {
    return normalized;
  }

  const chunkA = normalized.slice(4, 8);
  const chunkB = normalized.slice(8, 12);
  return `ASST-${chunkA}-${chunkB}`;
}

export function findTokenByAccessCode(rawCode: string): string | null {
  const normalized = normalizeAccessCode(rawCode);
  const restored = restoreCodeFormat(normalized);

  if (restored === demoResult.accessCode) {
    return demoResult.token;
  }

  const codeMap = readMap<string>(CODE_INDEX_KEY);
  return codeMap[restored] ?? null;
}

export function scenarioInputSummary(draft: ScenarioDraft): Array<{ label: string; value: string }> {
  const scenario = getScenario(draft.scenarioId);
  if (!scenario) return [];

  return scenario.fields
    .map((field) => ({ label: field.label, value: draft.inputs[field.name]?.trim() ?? "" }))
    .filter((entry) => entry.value.length > 0)
    .slice(0, 4);
}

export function resultAsPdfText(result: PurchasedResult): string {
  const scenario = getScenario(result.scenarioId);
  const title = scenario?.title ?? "AI Shopping Report";

  return [
    "AI Shopping - Полный разбор",
    `Сценарий: ${title}`,
    `Дата формирования: ${result.createdAt}`,
    `Токен результата: ${result.token}`,
    `Код доступа: ${result.accessCode}`,
    "",
    "Краткий итог",
    result.executiveSummary,
    "",
    "Основная рекомендация",
    result.coreDecision,
    "",
    "Почему такой вывод",
    ...result.whyThis.map((line, index) => `${index + 1}. ${line}`),
    "",
    "Альтернативы",
    ...result.alternatives.map((line, index) => `${index + 1}. ${line}`),
    "",
    "Что важно учесть",
    ...result.cautionFlags.map((line, index) => `${index + 1}. ${line}`),
    "",
    "Следующие шаги",
    ...result.actionPlan.map((line, index) => `${index + 1}. ${line}`),
    "",
    "Ограничение",
    "Этот разбор носит информационный характер и не является медицинским или юридическим назначением."
  ].join("\n");
}
