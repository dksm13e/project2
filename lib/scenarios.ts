export type ScenarioId = "fashion-size" | "fashion-fit-check" | "home-room-set" | "beauty-routine";

export type ScenarioField = {
  name: string;
  label: string;
  placeholder?: string;
  hint?: string;
  type?: "text" | "url" | "textarea" | "number" | "select";
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
};

export type ScenarioDefinition = {
  id: ScenarioId;
  route: string;
  categoryRoute: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  tagline: string;
  priceRub: number;
  weakOutcome: string;
  fullOutcome: string;
  heroPoints: string[];
  weakPreviewItems: string[];
  fullResultItems: string[];
  paywallTitle: string;
  fields: ScenarioField[];
};

const scenarioList: ScenarioDefinition[] = [
  {
    id: "fashion-size",
    route: "/fashion/size",
    categoryRoute: "/fashion",
    title: "Разбор размера одежды",
    shortTitle: "Подбор размера одежды",
    subtitle: "Снижаем риск промаха с размером до оформления заказа.",
    tagline: "Подбор размера без регистрации",
    priceRub: 349,
    weakOutcome: "Предварительный вывод: вероятный размер и главный риск",
    fullOutcome: "Полный разбор размера: альтернативы, посадка и PDF",
    heroPoints: [
      "Без email, без телефона, без кабинета",
      "Фокус на аналитике решения, а не на витрине товаров",
      "Результат открывается сразу после оплаты"
    ],
    weakPreviewItems: [
      "Вероятный размерный диапазон",
      "Ключевой риск по посадке",
      "Короткий следующий шаг перед покупкой"
    ],
    fullResultItems: [
      "Рекомендуемый и альтернативный размер",
      "Варианты посадки в зависимости от предпочтения",
      "Риск маломерности/большемерности",
      "PDF + код доступа"
    ],
    paywallTitle: "Полный разбор размера",
    fields: [
      {
        name: "product_url",
        label: "Ссылка на товар",
        type: "url",
        placeholder: "https://...",
        hint: "Добавьте карточку товара, чтобы учесть описание и таблицу размеров.",
        required: true
      },
      {
        name: "item_type",
        label: "Категория",
        type: "select",
        hint: "Категория влияет на логику посадки и размерные риски.",
        required: true,
        options: [
          { value: "hoodie", label: "Худи / свитшот" },
          { value: "tshirt", label: "Футболка / топ" },
          { value: "pants", label: "Брюки / джинсы" },
          { value: "dress", label: "Платье" },
          { value: "outerwear", label: "Верхняя одежда" }
        ]
      },
      {
        name: "height_cm",
        label: "Рост",
        type: "number",
        placeholder: "172",
        hint: "Укажите в сантиметрах.",
        required: true
      },
      {
        name: "weight_kg",
        label: "Вес",
        type: "number",
        placeholder: "64",
        hint: "Укажите в килограммах.",
        required: true
      },
      {
        name: "fit_preference",
        label: "Желаемая посадка",
        type: "select",
        hint: "Выбор влияет на рекомендуемую размерную стратегию.",
        required: true,
        options: [
          { value: "slim", label: "Ближе к телу" },
          { value: "regular", label: "Стандартная" },
          { value: "relaxed", label: "Свободная" }
        ]
      },
      {
        name: "usual_size",
        label: "Обычный размер (optional)",
        type: "text",
        placeholder: "Например: M, 46, W30",
        hint: "Необязательное поле для калибровки результата.",
        required: false
      },
      {
        name: "trusted_brand",
        label: "Бренд, который обычно сидит хорошо (optional)",
        type: "text",
        placeholder: "Например: Uniqlo / Zara / H&M",
        hint: "Если есть, добавьте 1 бренд для дополнительного контекста.",
        required: false
      }
    ]
  },
  {
    id: "fashion-fit-check",
    route: "/fashion/fit-check",
    categoryRoute: "/fashion",
    title: "Fit-разбор образа",
    shortTitle: "Проверка сочетания в образе",
    subtitle: "Проверка стилистической совместимости вещи под вашу цель.",
    tagline: "Быстрый fit-анализ до покупки",
    priceRub: 299,
    weakOutcome: "Предварительный вывод: fit-сигнал и ключевой риск",
    fullOutcome: "Полный fit-разбор: сочетания, триггеры mismatch и decision-map",
    heroPoints: [
      "Предварительный вывод для быстрой валидации",
      "Полная логика открывается после оплаты",
      "Без регистрационного барьера"
    ],
    weakPreviewItems: [
      "Базовый signal совместимости",
      "Один основной риск",
      "Короткий следующий шаг"
    ],
    fullResultItems: [
      "Варианты сочетаний по ситуации",
      "Триггеры mismatch и do-not-buy сигналы",
      "Альтернативные пути",
      "PDF + код доступа"
    ],
    paywallTitle: "Полный fit-разбор",
    fields: [
      {
        name: "product_url",
        label: "Ссылка на товар",
        type: "url",
        placeholder: "https://...",
        hint: "Нужна для первичного fit-анализа.",
        required: true
      },
      {
        name: "body_shape",
        label: "Тип телосложения",
        type: "select",
        required: true,
        options: [
          { value: "straight", label: "Прямой" },
          { value: "curvy", label: "Выраженные формы" },
          { value: "athletic", label: "Атлетичный" },
          { value: "petite", label: "Petite" }
        ]
      },
      {
        name: "style_goal",
        label: "Главная цель образа",
        type: "select",
        required: true,
        options: [
          { value: "clean", label: "Clean minimal" },
          { value: "smart", label: "Smart casual" },
          { value: "street", label: "Street" },
          { value: "capsule", label: "Capsule wardrobe" }
        ]
      },
      {
        name: "season",
        label: "Сезон",
        type: "select",
        required: true,
        options: [
          { value: "spring", label: "Весна" },
          { value: "summer", label: "Лето" },
          { value: "autumn", label: "Осень" },
          { value: "winter", label: "Зима" }
        ]
      },
      {
        name: "notes",
        label: "Комментарий (optional)",
        type: "textarea",
        placeholder: "Например: под что планируете носить",
        hint: "Необязательно, но делает результат точнее.",
        required: false
      }
    ]
  },
  {
    id: "home-room-set",
    route: "/home/room-set",
    categoryRoute: "/home",
    title: "Разбор набора для дома",
    shortTitle: "Подбор для дома",
    subtitle: "Собираем логичный набор под комнату, стиль и бюджет.",
    tagline: "Комнатный сет без эффекта маркетплейса",
    priceRub: 490,
    weakOutcome: "Предварительный вывод: тип набора и бюджетный вектор",
    fullOutcome: "Полный разбор набора: структура, бюджет, композиция, PDF",
    heroPoints: [
      "Аналитика по комнате, а не каталог товаров",
      "Бюджет и композиция учитываются вместе",
      "Результат сразу после оплаты"
    ],
    weakPreviewItems: [
      "Предварительный тип сета",
      "Оценка масштаба набора",
      "Общий бюджетный вектор"
    ],
    fullResultItems: [
      "Базовые и дополнительные позиции",
      "Логика распределения бюджета",
      "Советы по композиции и что можно не покупать",
      "PDF + код доступа"
    ],
    paywallTitle: "Полный разбор room set",
    fields: [
      {
        name: "room_type",
        label: "Тип комнаты",
        type: "select",
        hint: "Влияет на структуру приоритетов в наборе.",
        required: true,
        options: [
          { value: "bedroom", label: "Спальня" },
          { value: "living", label: "Гостиная" },
          { value: "kitchen", label: "Кухня" },
          { value: "workspace", label: "Рабочая зона" }
        ]
      },
      {
        name: "style",
        label: "Стиль",
        type: "select",
        hint: "Нужен для композиционной согласованности набора.",
        required: true,
        options: [
          { value: "minimal", label: "Минимализм" },
          { value: "warm", label: "Теплый натуральный" },
          { value: "modern", label: "Современный clean" },
          { value: "scandi", label: "Сканди" }
        ]
      },
      {
        name: "budget_rub",
        label: "Бюджет",
        type: "number",
        placeholder: "120000",
        hint: "Укажите общий бюджет в рублях.",
        required: true
      },
      {
        name: "room_area",
        label: "Площадь комнаты",
        type: "number",
        placeholder: "18",
        hint: "Укажите в м2 для корректного масштаба набора.",
        required: true
      },
      {
        name: "existing_items",
        label: "Что уже есть (optional)",
        type: "textarea",
        placeholder: "Кровать, тумба, торшер...",
        hint: "Добавьте предметы, которые хотите оставить.",
        required: false
      },
      {
        name: "reference_url",
        label: "Ссылка на понравившийся товар (optional)",
        type: "url",
        placeholder: "https://...",
        hint: "Можно добавить для ориентира по стилю.",
        required: false
      }
    ]
  },
  {
    id: "beauty-routine",
    route: "/beauty/routine",
    categoryRoute: "/beauty",
    title: "Разбор beauty routine",
    shortTitle: "Подбор ухода",
    subtitle: "Собираем структуру ухода с учетом цели, чувствительности и бюджета.",
    tagline: "Логика routine без лишнего шума",
    priceRub: 329,
    weakOutcome: "Предварительный вывод: тип routine и общий фокус",
    fullOutcome: "Полный разбор routine: шаги, ограничения, бюджет, PDF",
    heroPoints: [
      "Не медицинский сервис, а информационный разбор",
      "Без аккаунта и лишних шагов",
      "Полный результат открывается сразу после оплаты"
    ],
    weakPreviewItems: [
      "Черновой тип routine",
      "Оценка количества шагов",
      "Общий фокус ухода"
    ],
    fullResultItems: [
      "Шаги по порядку (AM/PM)",
      "Что обязательно и что опционально",
      "Что лучше избегать и почему",
      "PDF + код доступа"
    ],
    paywallTitle: "Полный разбор beauty routine",
    fields: [
      {
        name: "skin_type",
        label: "Тип кожи",
        type: "select",
        hint: "Базовый фактор для структуры routine.",
        required: true,
        options: [
          { value: "dry", label: "Сухая" },
          { value: "combination", label: "Комбинированная" },
          { value: "oily", label: "Жирная" },
          { value: "sensitive", label: "Чувствительная" }
        ]
      },
      {
        name: "main_goal",
        label: "Главная задача",
        type: "select",
        hint: "Определяет приоритетные блоки ухода.",
        required: true,
        options: [
          { value: "acne", label: "Контроль высыпаний" },
          { value: "texture", label: "Текстура и тон" },
          { value: "hydration", label: "Увлажнение" },
          { value: "antiage", label: "Первые anti-age задачи" }
        ]
      },
      {
        name: "sensitivity_level",
        label: "Чувствительность",
        type: "select",
        hint: "Влияет на скорость и интенсивность внедрения шагов.",
        required: true,
        options: [
          { value: "low", label: "Низкая" },
          { value: "medium", label: "Средняя" },
          { value: "high", label: "Высокая" }
        ]
      },
      {
        name: "budget_rub",
        label: "Бюджет",
        type: "number",
        placeholder: "6000",
        hint: "Ориентир на месяц, в рублях.",
        required: true
      },
      {
        name: "reference_url",
        label: "Ссылка на продукт (optional)",
        type: "url",
        placeholder: "https://...",
        hint: "Если есть конкретный продукт для проверки.",
        required: false
      },
      {
        name: "current_routine",
        label: "Текущий уход (optional)",
        type: "textarea",
        placeholder: "Кратко перечислите текущие шаги",
        hint: "Необязательное поле для более точной адаптации.",
        required: false
      }
    ]
  }
];

export const SCENARIOS: Record<ScenarioId, ScenarioDefinition> = Object.fromEntries(
  scenarioList.map((scenario) => [scenario.id, scenario])
) as Record<ScenarioId, ScenarioDefinition>;

export const SCENARIO_LIST = scenarioList;

export const PRIMARY_SCENARIOS: ScenarioId[] = ["fashion-size", "home-room-set", "beauty-routine"];

export function getScenario(scenarioId: string | null | undefined): ScenarioDefinition | null {
  if (!scenarioId) return null;
  return SCENARIOS[scenarioId as ScenarioId] ?? null;
}
