import Link from "next/link";
import { TrackedLink } from "@/components/TrackedLink";
import { ANALYTICS_EVENT_NAMES } from "@/lib/analytics";
import { HomeOnboardingGuide } from "@/components/HomeOnboardingGuide";
import { HomeDirectionSelector } from "@/components/HomeDirectionSelector";

const howItWorksSteps = [
  {
    title: "Выберите направление",
    text: "Одежда, дом или уход"
  },
  {
    title: "Ответьте на вопросы",
    text: "Это занимает меньше минуты"
  },
  {
    title: "Получите первый вывод",
    text: "Сразу увидите основную рекомендацию"
  },
  {
    title: "Откройте полный разбор",
    text: "Только если нужны детали"
  }
];

const usefulCases = [
  "Когда важно не ошибиться с размером перед оплатой.",
  "Когда вещь нравится, но есть сомнения по посадке.",
  "Когда нужно спокойно собрать комнату без лишних покупок.",
  "Когда хочется понять стиль до того, как тратить бюджет.",
  "Когда уход стал слишком сложным и хочется убрать лишнее.",
  "Когда не хочется перегружать кожу новыми шагами."
];

const microProofItems = [
  "Не ошибиться перед покупкой",
  "Понять, что проверить до заказа",
  "Спокойнее принять решение",
  "Убрать лишние сомнения"
];

const resultExamples = [
  {
    direction: "Одежда",
    title: "Размер и посадка",
    intro: "Сначала вы увидите ориентир по размеру и главный риск.",
    lines: [
      "Рекомендуемый размер: M",
      "Альтернатива: L для более свободной посадки",
      "Главный риск: плечи и длина рукава",
      "Что проверить перед покупкой: мерки изделия"
    ],
    paid: [
      "Сценарий посадки",
      "Что даст материал",
      "Что проверить в карточке товара",
      "PDF + код доступа"
    ]
  },
  {
    direction: "Дом",
    title: "Комната и стиль",
    intro: "Сначала вы увидите стартовый вектор по комнате и бюджету.",
    lines: [
      "Базовый стиль: светлая спокойная база",
      "Приоритет: хранение и мягкий свет",
      "Что не покупать сразу: лишний мелкий декор",
      "Что проверить: масштаб и проходы"
    ],
    paid: [
      "Обязательные и дополнительные позиции",
      "Бюджетная логика",
      "Композиция по комнате",
      "PDF + код доступа"
    ]
  },
  {
    direction: "Уход",
    title: "Спокойная схема ухода",
    intro: "Сначала вы увидите базовый формат ухода и главный риск перегруза.",
    lines: [
      "Утро: мягкое очищение + защита",
      "Вечер: восстановление барьера",
      "Что убрать: перегружающее сочетание активов",
      "Что сохранить: спокойную базу"
    ],
    paid: [
      "Утро и вечер по шагам",
      "Что убрать",
      "Как вводить новое",
      "PDF + код доступа"
    ]
  }
];

const valueItems = [
  {
    title: "Первый вывод до оплаты",
    text: "Сразу понимаете основной ориентир и главный риск перед покупкой."
  },
  {
    title: "Понятную рекомендацию",
    text: "Не общий совет, а короткий вывод по вашей задаче."
  },
  {
    title: "Что проверить дальше",
    text: "Получаете следующий шаг, который помогает не ошибиться."
  },
  {
    title: "Полный разбор — только если нужен",
    text: "Открываете подробный результат, когда хотите больше деталей."
  }
];

const faqPreview = [
  {
    question: "Нужна ли регистрация?",
    answer: "Нет. Сервис работает без личного кабинета."
  },
  {
    question: "Можно сначала попробовать бесплатно?",
    answer: "Да. Сначала вы получаете предварительный вывод."
  },
  {
    question: "Что дает полный разбор?",
    answer: "Подробные рекомендации, риски, альтернативы, PDF и код доступа."
  }
];

export default function HomePage() {
  return (
    <>
      <HomeOnboardingGuide />

      <div className="home-light-root">
        <div className="home-light-scene" aria-hidden="true">
          <span className="home-shape-light home-shape-arch-right" />
          <span className="home-shape-light home-shape-arch-left" />
          <span className="home-shape-light home-shape-round-center" />
          <span className="home-shape-light home-shape-depth-bottom" />
          <span className="home-fragment home-fragment-a" />
          <span className="home-fragment home-fragment-b" />
          <span className="home-fragment home-fragment-c" />
          <span className="home-fragment home-fragment-d" />
          <span className="home-fragment home-fragment-e" />
        </div>

        <div className="home-light-content space-y-12 sm:space-y-14">
          <section className="home-editorial-hero relative overflow-hidden rounded-[2.4rem] px-6 py-12 sm:px-10 sm:py-16">
            <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="space-y-6">
                <p className="home-mini-label inline-flex">Персональный помощник перед покупкой</p>
                <p className="home-slogan">Выбирайте уверенно. Покупайте без ошибок.</p>
                <h1 className="display-title max-w-4xl text-balance">Помогаем принять решение до покупки</h1>
                <p className="max-w-2xl text-base text-[#59606d] sm:text-lg">
                  Один сервис для одежды, дома и ухода. Сначала вы видите короткий предварительный вывод и решаете,
                  нужен ли полный разбор.
                </p>

                <div className="flex flex-wrap gap-3">
                  <TrackedLink
                    id="onb-start-btn"
                    href="/fashion"
                    eventName={ANALYTICS_EVENT_NAMES.heroCtaClick}
                    eventPayload={{ module: "fashion", cta_label: "Начать подбор" }}
                    className="home-btn-primary"
                  >
                    Начать подбор
                  </TrackedLink>

                  <TrackedLink
                    href="/#how-it-works"
                    eventName={ANALYTICS_EVENT_NAMES.heroCtaClick}
                    eventPayload={{ module: "flow", cta_label: "Как это работает" }}
                    className="home-btn-secondary"
                  >
                    Как это работает
                  </TrackedLink>

                  <TrackedLink
                    href="/open-by-code"
                    eventName={ANALYTICS_EVENT_NAMES.heroCtaClick}
                    eventPayload={{ module: "access", cta_label: "Открыть по коду" }}
                    className="home-btn-secondary"
                  >
                    Открыть по коду
                  </TrackedLink>
                </div>

                <HomeDirectionSelector />

                <p className="text-sm text-[#69707d]">Без регистрации • Без номера телефона • Код доступа после оплаты</p>
              </div>

              <aside id="onb-quick-info" className="home-snapshot-shell">
                <div className="home-snapshot-topline">
                  <span className="home-dot" />
                  <span>Снимок результата</span>
                </div>

                <div className="home-snapshot-main">
                  <p className="home-snapshot-caption">Главная рекомендация</p>
                  <h3 className="home-snapshot-title">Рекомендуемый размер: M</h3>
                  <p className="home-snapshot-subtitle">Альтернатива: L, если нужен свободный силуэт</p>
                </div>

                <div className="home-snapshot-row">
                  <article className="home-snapshot-card">
                    <p className="home-snapshot-card-label">Риск</p>
                    <p className="home-snapshot-card-value">Средний</p>
                    <p className="home-snapshot-card-text">Проверьте плечи и длину рукава</p>
                  </article>
                  <article className="home-snapshot-card">
                    <p className="home-snapshot-card-label">Следующий шаг</p>
                    <p className="home-snapshot-card-value">Сверить мерки</p>
                    <p className="home-snapshot-card-text">С таблицей конкретного бренда</p>
                  </article>
                  <article className="home-snapshot-card">
                    <p className="home-snapshot-card-label">После оплаты</p>
                    <p className="home-snapshot-card-value">Полный разбор</p>
                    <p className="home-snapshot-card-text">Альтернативы, риски, PDF и код доступа</p>
                  </article>
                </div>
              </aside>
            </div>
          </section>

          <section className="home-editorial-block home-micro-proof p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="home-section-heading">Подходит, если вы хотите</h2>
              <span className="pill">Что вы увидите</span>
            </div>
            <div className="home-micro-proof-list mt-5">
              {microProofItems.map((item) => (
                <p key={item} className="home-micro-proof-item">
                  {item}
                </p>
              ))}
            </div>
          </section>

          <section id="how-it-works" className="home-editorial-block scroll-mt-28 p-6 sm:p-8">
            <h2 className="home-section-heading">Как это работает</h2>
            <div className="home-how-wrapper mt-7">
              <div className="home-how-line" aria-hidden="true" />
              <ol className="grid gap-6 md:grid-cols-4">
                {howItWorksSteps.map((step, index) => (
                  <li key={step.title} className="home-how-step">
                    <span className="home-how-number">{index + 1}</span>
                    <p className="mt-3 text-sm font-medium text-[#202734]">{step.title}</p>
                    <p className="mt-1 text-sm text-[#67707d]">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="home-editorial-block p-6 sm:p-8">
            <h2 className="home-section-heading">Примеры результата</h2>
            <p className="mt-2 text-sm text-[#617083]">
              Короткие примеры, чтобы сразу понять, как выглядит итоговый формат разбора.
            </p>
            <div className="home-result-examples mt-5">
              {resultExamples.map((card) => (
                <article key={card.direction} className="home-result-card">
                  <p className="home-result-kicker">{card.direction}</p>
                  <h3 className="home-result-title">{card.title}</h3>
                  <p className="home-result-subtitle">{card.intro}</p>
                  <ul className="mt-3 space-y-2 text-sm text-[#5d6a7d]">
                    {card.lines.map((line) => (
                      <li key={line}>- {line}</li>
                    ))}
                  </ul>
                  <div className="home-result-paid mt-4">
                    <p className="home-result-paid-label">После оплаты</p>
                    <ul className="mt-2 space-y-1.5 text-xs text-[#5f6e84]">
                      {card.paid.map((line) => (
                        <li key={line}>- {line}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="home-editorial-block p-6 sm:p-8">
            <h2 className="home-section-heading">Когда это полезно</h2>
            <div className="home-use-cases-grid mt-5">
              {usefulCases.map((item) => (
                <article key={item} className="home-use-case">
                  {item}
                </article>
              ))}
            </div>
          </section>

          <section className="home-editorial-block p-6 sm:p-8">
            <h2 className="home-section-heading">Что вы получаете</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {valueItems.map((item) => (
                <article key={item.title} className="home-trust-item px-4 py-3">
                  <p className="text-sm font-semibold text-[#243042]">{item.title}</p>
                  <p className="mt-1 text-sm text-[#626f81]">{item.text}</p>
                </article>
              ))}
            </div>
            <p className="mt-4 text-sm text-[#6b7482]">Без регистрации • Без номера телефона • Код доступа после оплаты</p>
          </section>

          <section className="home-editorial-block p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="home-section-heading">Частые вопросы</h2>
              <Link href="/faq" className="home-btn-secondary">
                Смотреть все вопросы
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {faqPreview.map((item) => (
                <details key={item.question} className="home-faq-lite px-4 py-3 text-sm">
                  <summary className="cursor-pointer list-none font-medium text-[#232b38]">{item.question}</summary>
                  <p className="mt-2 text-[#65707d]">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
