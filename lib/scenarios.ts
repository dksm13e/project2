export type ScenarioId = "fashion-size" | "fashion-fit-check" | "home-room-set" | "beauty-routine";

export type ScenarioField = {
  name: string;
  label: string;
  placeholder?: string;
  hint?: string;
  type?: "text" | "url" | "textarea" | "number" | "select" | "multiselect" | "file";
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  accept?: string;
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

const seasonOptions = [
  { value: "spring", label: "Весна" },
  { value: "summer", label: "Лето" },
  { value: "autumn", label: "Осень" },
  { value: "winter", label: "Зима" },
  { value: "all-season", label: "Круглый год" }
];

const scenarioList: ScenarioDefinition[] = [
  {
    id: "fashion-size",
    route: "/fashion/size",
    categoryRoute: "/fashion",
    title: "Разбор размера одежды",
    shortTitle: "Подбор размера одежды",
    subtitle: "AI интерпретирует вещь, посадку и материал, чтобы снизить риск промаха с размером.",
    tagline: "Размерный разбор с учетом категории и ткани",
    priceRub: 349,
    weakOutcome: "Предварительный вывод: категория, размерный вектор и главный риск",
    fullOutcome: "Полный разбор: размер, материал, рисковые зоны, проверки и PDF",
    heroPoints: [
      "Распознавание типа вещи из ссылки/контекста",
      "Учет желаемой посадки и материала",
      "Понижение уровня уверенности при слабом входе"
    ],
    weakPreviewItems: [
      "Распознанная категория товара",
      "Главный размерный вектор",
      "Один ключевой риск и следующий шаг"
    ],
    fullResultItems: [
      "Главный и альтернативный размер",
      "Логика выбора и уровень уверенности",
      "Влияние материала и зоны риска",
      "Что проверить до покупки и что может сместить рекомендацию"
    ],
    paywallTitle: "Полный разбор размера",
    fields: [
      {
        name: "product_url",
        label: "Ссылка на товар",
        type: "url",
        placeholder: "https://...",
        hint: "По ссылке AI пытается распознать тип вещи и бренд.",
        required: false
      },
      {
        name: "product_title",
        label: "Название товара (если ссылка слабая)",
        type: "text",
        placeholder: "Например: Худи свободной посадки",
        hint: "Помогает отличить футболку, худи и свитшот.",
        required: false
      },
      {
        name: "item_category",
        label: "Категория",
        type: "select",
        required: true,
        options: [
          { value: "футболка", label: "Футболка" },
          { value: "худи", label: "Худи" },
          { value: "свитшот", label: "Свитшот" },
          { value: "рубашка", label: "Рубашка" },
          { value: "куртка", label: "Куртка" },
          { value: "жилет", label: "Жилет" },
          { value: "брюки", label: "Брюки" },
          { value: "джинсы", label: "Джинсы" },
          { value: "шорты", label: "Шорты" },
          { value: "платье", label: "Платье" },
          { value: "юбка", label: "Юбка" },
          { value: "обувь", label: "Обувь" },
          { value: "other", label: "Другое" }
        ]
      },
      {
        name: "brand",
        label: "Бренд",
        type: "text",
        placeholder: "Например: Uniqlo",
        hint: "Если бренд неизвестный, уровень уверенности будет ниже.",
        required: false
      },
      {
        name: "gender_profile",
        label: "Пол / профиль",
        type: "select",
        required: true,
        options: [
          { value: "women", label: "Женский" },
          { value: "men", label: "Мужской" },
          { value: "unisex", label: "Унисекс" }
        ]
      },
      {
        name: "height_cm",
        label: "Рост (см)",
        type: "number",
        placeholder: "172",
        required: true
      },
      {
        name: "weight_kg",
        label: "Вес (кг)",
        type: "number",
        placeholder: "64",
        required: true
      },
      {
        name: "body_shape",
        label: "Телосложение",
        type: "select",
        required: true,
        options: [
          { value: "slim", label: "Стройное" },
          { value: "regular", label: "Стандартное" },
          { value: "athletic", label: "Атлетичное" },
          { value: "curvy", label: "С выраженными формами" },
          { value: "plus-size", label: "Плюс-сайз" }
        ]
      },
      {
        name: "usual_size",
        label: "Обычный размер",
        type: "text",
        placeholder: "Например: M / 46 / W30",
        required: false
      },
      {
        name: "desired_fit",
        label: "Желаемая посадка",
        type: "select",
        required: true,
        options: [
          { value: "figure", label: "По фигуре" },
          { value: "regular", label: "Стандартная" },
          { value: "relaxed", label: "Свободная" },
          { value: "oversize", label: "Оверсайз" }
        ]
      },
      {
        name: "season",
        label: "Сезон",
        type: "select",
        required: true,
        options: seasonOptions
      },
      {
        name: "material_composition",
        label: "Материал / состав",
        type: "text",
        placeholder: "Например: 80% хлопок, 20% полиэстер",
        hint: "Материал влияет на эластичность, жёсткость и риск усадки.",
        required: false
      },
      {
        name: "fit_priority",
        label: "Что важнее в посадке",
        type: "multiselect",
        required: false,
        options: [
          { value: "плечи", label: "Плечи" },
          { value: "грудь", label: "Грудь" },
          { value: "талия", label: "Талия" },
          { value: "бедра", label: "Бёдра" },
          { value: "длина", label: "Длина" },
          { value: "рукав", label: "Рукав" }
        ]
      },
      {
        name: "good_fit_item",
        label: "Вещь, которая сидит хорошо (необязательно)",
        type: "textarea",
        placeholder: "Опишите коротко референсную вещь",
        required: false
      },
      {
        name: "fit_dislikes",
        label: "Что обычно не нравится в посадке (необязательно)",
        type: "textarea",
        placeholder: "Например: давит в плечах, короткий рукав",
        required: false
      },
      {
        name: "good_fit_photo",
        label: "Фото вещи, которая сидит хорошо (необязательно)",
        type: "file",
        accept: "image/*",
        hint: "Слой анализа фото: используется как дополнительный контекст.",
        required: false
      },
      {
        name: "item_photo",
        label: "Фото товара / скрин (необязательно)",
        type: "file",
        accept: "image/*",
        required: false
      }
    ]
  },
  {
    id: "fashion-fit-check",
    route: "/fashion/fit-check",
    categoryRoute: "/fashion",
    title: "Разбор сочетания до покупки",
    shortTitle: "Проверка, впишется ли вещь в образ",
    subtitle: "Помогаем заранее понять, будет ли вещь работать в вашем гардеробе и под вашу цель.",
    tagline: "Понятный разбор сочетания до покупки",
    priceRub: 299,
    weakOutcome: "Предварительный вывод: сигнал совместимости, главный риск и что может выбиваться по стилю",
    fullOutcome: "Полный разбор: с чем вещь работает лучше, с чем спорит и стоит ли брать её под ваш сценарий",
    heroPoints: [
      "Сначала видите основной сигнал совместимости",
      "Понимаете главный риск до оплаты",
      "Открываете детали только когда нужны"
    ],
    weakPreviewItems: [
      "Поймёте, впишется ли вещь в ваш образ",
      "Увидите один главный риск",
      "Поймёте, что может выбиваться по стилю"
    ],
    fullResultItems: [
      "С чем вещь работает лучше",
      "С чем она может спорить",
      "Что смягчит несовпадение",
      "Стоит ли брать вещь под ваш сценарий",
      "PDF + код доступа"
    ],
    paywallTitle: "Полный разбор сочетания",
    fields: [
      {
        name: "product_url",
        label: "Ссылка на товар",
        type: "url",
        placeholder: "https://...",
        hint: "Нужна для первичной оценки, как вещь впишется в ваш образ.",
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
          { value: "petite", label: "Миниатюрный" }
        ]
      },
      {
        name: "style_goal",
        label: "Главная цель образа",
        type: "select",
        required: true,
        options: [
          { value: "clean", label: "Чистый минимализм" },
          { value: "smart", label: "Сдержанный повседневный" },
          { value: "street", label: "Уличный стиль" },
          { value: "capsule", label: "Капсульный гардероб" }
        ]
      },
      {
        name: "season",
        label: "Сезон",
        type: "select",
        required: true,
        options: seasonOptions
      },
      {
        name: "notes",
        label: "Комментарий (необязательно)",
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
    subtitle: "AI учитывает геометрию комнаты, стиль, бюджет, материалы и фото, чтобы дать практичный вектор.",
    tagline: "Глубокий разбор комнаты без каталога",
    priceRub: 490,
    weakOutcome: "Предварительный вывод: тип набора, вектор стиля и главный риск",
    fullOutcome: "Полный разбор: обязательные, дополнительные и отложенные покупки + композиция + PDF",
    heroPoints: [
      "Учет формы, площади и высоты потолка",
      "Учет фото комнаты, референсов и вашей мебели",
      "Материалы, цвет и бюджет в одном решении"
    ],
    weakPreviewItems: ["Тип набора", "Общий вектор композиции", "Главный риск бюджета/масштаба"],
    fullResultItems: [
      "Визуальная стратегия и уровень уверенности",
      "Обязательные / дополнительные / позже",
      "Материалы, цвета, масштаб и частые ошибки",
      "Что не покупать прямо сейчас"
    ],
    paywallTitle: "Полный разбор комнаты",
    fields: [
      {
        name: "room_type",
        label: "Тип комнаты",
        type: "select",
        required: true,
        options: [
          { value: "bedroom", label: "Спальня" },
          { value: "living", label: "Гостиная" },
          { value: "workspace", label: "Кабинет" },
          { value: "kids", label: "Детская" },
          { value: "kitchen", label: "Кухня" },
          { value: "hallway", label: "Прихожая" },
          { value: "bathroom", label: "Ванная" },
          { value: "balcony", label: "Балкон" },
          { value: "studio", label: "Студия" }
        ]
      },
      {
        name: "room_area",
        label: "Площадь комнаты (м²)",
        type: "number",
        placeholder: "18",
        required: true
      },
      {
        name: "room_shape",
        label: "Форма комнаты",
        type: "select",
        required: true,
        options: [
          { value: "square", label: "Квадрат" },
          { value: "elongated", label: "Вытянутая" },
          { value: "narrow", label: "Узкая" },
          { value: "open-space", label: "Открытая планировка" },
          { value: "non-standard", label: "Нестандартная" }
        ]
      },
      {
        name: "ceiling_height",
        label: "Высота потолков",
        type: "select",
        required: true,
        options: [
          { value: "low", label: "Низкие" },
          { value: "standard", label: "Стандарт" },
          { value: "high", label: "Высокие" }
        ]
      },
      {
        name: "main_goal",
        label: "Главная цель",
        type: "select",
        required: true,
        options: [
          { value: "cozy", label: "Уют" },
          { value: "storage", label: "Хранение" },
          { value: "workspace", label: "Рабочая зона" },
          { value: "calm", label: "Спокойный интерьер" },
          { value: "premium-look", label: "Визуально дороже" },
          { value: "minimalism", label: "Минимализм" },
          { value: "family-practical", label: "Семейный и практичный" },
          { value: "rental-friendly", label: "Под аренду" }
        ]
      },
      {
        name: "style",
        label: "Стиль",
        type: "select",
        required: true,
        options: [
          { value: "minimalism", label: "Минимализм" },
          { value: "warm-minimal", label: "Тёплый минимализм" },
          { value: "scandi", label: "Сканди" },
          { value: "japandi", label: "Джапанди" },
          { value: "modern-clean", label: "Современный чистый" },
          { value: "soft-loft", label: "Мягкий лофт" },
          { value: "modern-organic", label: "Современный органичный" },
          { value: "quiet-luxury-light", label: "Светлый спокойный премиум" },
          { value: "natural-neutral", label: "Природный нейтральный" },
          { value: "cozy-basic", label: "Уютный базовый" },
          { value: "storage-first", label: "Хранение в приоритете" },
          { value: "compact-studio", label: "Компактная студия" },
          { value: "hotel-like-calm", label: "Спокойный как отель" },
          { value: "soft-feminine", label: "Мягкий женственный" },
          { value: "masculine-clean", label: "Сдержанный графичный" },
          { value: "family-practical", label: "Семейный и практичный" },
          { value: "rental-light", label: "Аренда без перегруза" },
          { value: "workspace-functional", label: "Функциональная рабочая зона" },
          { value: "dark-accent-modern", label: "Современный с тёмными акцентами" },
          { value: "light-premium-simple", label: "Светлый премиум минимал" }
        ]
      },
      {
        name: "budget_rub",
        label: "Бюджет (RUB)",
        type: "number",
        placeholder: "150000",
        required: true
      },
      {
        name: "existing_items",
        label: "Что уже есть",
        type: "textarea",
        placeholder: "Например: диван, стол, торшер",
        required: false
      },
      {
        name: "must_keep",
        label: "Что точно оставить",
        type: "textarea",
        placeholder: "Предметы, которые остаются обязательно",
        required: false
      },
      {
        name: "first_priority_buy",
        label: "Что хочется купить в первую очередь",
        type: "textarea",
        placeholder: "Ключевые позиции первого этапа",
        required: false
      },
      {
        name: "liked_materials",
        label: "Любимые материалы",
        type: "multiselect",
        required: false,
        options: [
          { value: "wood", label: "Дерево" },
          { value: "metal", label: "Металл" },
          { value: "glass", label: "Стекло" },
          { value: "fabric", label: "Ткань" },
          { value: "rattan", label: "Ротанг" },
          { value: "stone", label: "Камень" },
          { value: "matte", label: "Матовые поверхности" },
          { value: "soft-textures", label: "Мягкие фактуры" }
        ]
      },
      {
        name: "liked_colors",
        label: "Цвета, которые нравятся",
        type: "text",
        placeholder: "Например: теплый бежевый, оливковый",
        required: false
      },
      {
        name: "disliked_colors",
        label: "Цвета, которые не нравятся",
        type: "text",
        placeholder: "Например: ярко-красный, холодный серый",
        required: false
      },
      {
        name: "kids_pets",
        label: "Дети / животные",
        type: "select",
        required: true,
        options: [
          { value: "none", label: "Нет" },
          { value: "kids", label: "Есть дети" },
          { value: "pets", label: "Есть животные" },
          { value: "both", label: "И дети, и животные" }
        ]
      },
      {
        name: "rental_constraints",
        label: "Есть ограничения аренды?",
        type: "select",
        required: true,
        options: [
          { value: "yes", label: "Да" },
          { value: "no", label: "Нет" }
        ]
      },
      {
        name: "reference_url",
        label: "Ссылка на понравившийся товар (необязательно)",
        type: "url",
        placeholder: "https://...",
        required: false
      },
      {
        name: "room_photo",
        label: "Фото комнаты (необязательно)",
        type: "file",
        accept: "image/*",
        required: false
      },
      {
        name: "reference_interior_photo",
        label: "Фото понравившегося интерьера (необязательно)",
        type: "file",
        accept: "image/*",
        required: false
      },
      {
        name: "existing_furniture_photo",
        label: "Фото уже имеющейся мебели (необязательно)",
        type: "file",
        accept: "image/*",
        required: false
      }
    ]
  },
  {
    id: "beauty-routine",
    route: "/beauty/routine",
    categoryRoute: "/beauty",
    title: "Разбор схемы ухода",
    shortTitle: "Понятный уход без перегруза",
    subtitle: "AI помогает собрать спокойную схему ухода: что оставить, что убрать и как аккуратно добавлять новое.",
    tagline: "Понятный разбор ухода без лишних шагов",
    priceRub: 329,
    weakOutcome: "Предварительный вывод: базовый формат ухода, главный фокус и один риск перегруза",
    fullOutcome: "Полный разбор: схема на утро и вечер, что оставить, что убрать, что не смешивать и PDF",
    heroPoints: [
      "Распознавание ролей продуктов по ссылке/названию/контексту",
      "Оценка перегруза или недосбора схемы",
      "Консервативный режим при высокой чувствительности"
    ],
    weakPreviewItems: ["Базовый формат ухода", "Основной фокус", "Один безопасный следующий шаг"],
    fullResultItems: [
      "Схема на утро и вечер",
      "Что оставить и что убрать",
      "Что не сочетать и как вводить шаги",
      "Упрощённый вариант и бюджетная логика"
    ],
    paywallTitle: "Полный разбор ухода",
    fields: [
      {
        name: "skin_type",
        label: "Тип кожи",
        type: "select",
        required: true,
        options: [
          { value: "dry", label: "Сухая" },
          { value: "normal", label: "Нормальная" },
          { value: "combination", label: "Комбинированная" },
          { value: "oily", label: "Жирная" },
          { value: "sensitive", label: "Чувствительная" }
        ]
      },
      {
        name: "concerns",
        label: "Что вас сейчас беспокоит",
        type: "multiselect",
        required: false,
        options: [
          { value: "dehydration", label: "Обезвоженность" },
          { value: "redness", label: "Покраснение" },
          { value: "acne", label: "Акне" },
          { value: "post-acne", label: "Постакне" },
          { value: "dullness", label: "Тусклость" },
          { value: "uneven-tone", label: "Неровный тон" },
          { value: "wrinkles", label: "Морщины" },
          { value: "reactivity", label: "Реактивность" },
          { value: "barrier", label: "Барьер нарушен" }
        ]
      },
      {
        name: "sensitivity_level",
        label: "Чувствительность",
        type: "select",
        required: true,
        options: [
          { value: "low", label: "Низкая" },
          { value: "medium", label: "Средняя" },
          { value: "high", label: "Высокая" }
        ]
      },
      {
        name: "experience_level",
        label: "Опыт в уходе",
        type: "select",
        required: true,
        options: [
          { value: "beginner", label: "Новичок" },
          { value: "basic", label: "Базовый" },
          { value: "advanced", label: "Продвинутый" }
        ]
      },
      {
        name: "desired_steps",
        label: "Сколько шагов хочется",
        type: "select",
        required: true,
        options: [
          { value: "minimum", label: "Минимум" },
          { value: "3-4", label: "3-4 шага" },
          { value: "5+", label: "5+ шагов" }
        ]
      },
      {
        name: "routine_time",
        label: "Когда нужен уход",
        type: "select",
        required: true,
        options: [
          { value: "am", label: "Только утро" },
          { value: "pm", label: "Только вечер" },
          { value: "both", label: "Утро + вечер" }
        ]
      },
      {
        name: "season",
        label: "Сезон",
        type: "select",
        required: true,
        options: seasonOptions
      },
      {
        name: "budget_rub",
        label: "Бюджет",
        type: "number",
        placeholder: "6000",
        required: true
      },
      {
        name: "current_routine",
        label: "Что используете сейчас",
        type: "textarea",
        placeholder: "Опишите текущие шаги и продукты",
        required: false
      },
      {
        name: "not_suitable_products",
        label: "Что уже не подошло",
        type: "textarea",
        placeholder: "Что вызывало раздражение/не понравилось",
        required: false
      },
      {
        name: "active_attitude",
        label: "Отношение к активам",
        type: "select",
        required: true,
        options: [
          { value: "acids_ok", label: "Ок с кислотами" },
          { value: "retinoids_ok", label: "Ок с ретиноидами" },
          { value: "without_actives", label: "Лучше без активов" },
          { value: "not_sure", label: "Не знаю" }
        ]
      },
      {
        name: "fragrance_free",
        label: "Важно, чтобы было без отдушек?",
        type: "select",
        required: true,
        options: [
          { value: "yes", label: "Да" },
          { value: "no", label: "Нет" },
          { value: "not_important", label: "Не важно" }
        ]
      },
      {
        name: "reference_url",
        label: "Ссылка на продукт (необязательно)",
        type: "url",
        placeholder: "https://...",
        required: false
      },
      {
        name: "current_products_photo",
        label: "Фото текущих средств / набора (необязательно)",
        type: "file",
        accept: "image/*",
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
