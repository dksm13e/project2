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
  "Когда нужно собрать комнату спокойно и без хаоса.",
  "Когда хочется упростить уход и убрать лишнее."
];

const microProofItems = [
  "Не ошибиться перед покупкой",
  "Понять следующий шаг без перегруза",
  "Снять лишние сомнения",
  "Принять решение спокойнее и быстрее"
];

const resultExamples = [
  {
    direction: "Одежда",
    title: "Размер и посадка",
    lines: [
      "Рекомендуемый размер: M",
      "Альтернатива: L для более свободной посадки",
      "Что проверить: плечи и длину рукава"
    ]
  },
  {
    direction: "Дом",
    title: "Комната и стиль",
    lines: [
      "Базовый вектор: спокойная светлая база",
      "Приоритет: хранение и мягкий свет",
      "Что не покупать сразу: лишний мелкий декор"
    ]
  },
  {
    direction: "Уход",
    title: "Спокойная схема ухода",
    lines: [
      "Утро: мягкое очищение и защита",
      "Вечер: восстановление барьера",
      "Что убрать: перегружающее сочетание активов"
    ]
  }
];

const valueItems = [
  {
    title: "Первый вывод до оплаты",
    text: "Сразу видите базовую рекомендацию и понимаете, насколько подходящий вектор."
  },
  {
    title: "Понятная рекомендация",
    text: "Без перегруза: ключевой вывод, главный риск и конкретный ориентир перед покупкой."
  },
  {
    title: "Следующий шаг перед покупкой",
    text: "Получаете практичный чек-поинт, который снижает риск ошибки на следующем действии."
  },
  {
    title: "Полный разбор при необходимости",
    text: "Открываете подробный результат только если нужно больше глубины и деталей."
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
                <p className="home-mini-label inline-flex">Private digital advisor</p>
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
                    href="#how-it-works"
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
              <span className="pill">Коротко и по делу</span>
            </div>
            <div className="home-micro-proof-list mt-5">
              {microProofItems.map((item) => (
                <p key={item} className="home-micro-proof-item">
                  {item}
                </p>
              ))}
            </div>
          </section>

          <section id="how-it-works" className="home-editorial-block p-6 sm:p-8">
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
                  <ul className="mt-3 space-y-2 text-sm text-[#5d6a7d]">
                    {card.lines.map((line) => (
                      <li key={line}>- {line}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="home-editorial-block p-6 sm:p-8">
            <h2 className="home-section-heading">Для чего это полезно</h2>
            <div className="mt-5 space-y-3">
              {usefulCases.map((item) => (
                <p key={item} className="home-editorial-statement">
                  {item}
                </p>
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
