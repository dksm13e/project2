import Link from "next/link";
import { SCENARIOS } from "@/lib/scenarios";
import { TrackedLink } from "@/components/TrackedLink";
import { ANALYTICS_EVENT_NAMES } from "@/lib/analytics";
import { HomeOnboardingGuide } from "@/components/HomeOnboardingGuide";

const directionLinks = [
  { label: "Одежда", href: SCENARIOS["fashion-size"].route, module: "fashion" },
  { label: "Дом", href: SCENARIOS["home-room-set"].route, module: "home" },
  { label: "Уход", href: SCENARIOS["beauty-routine"].route, module: "beauty" }
];

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
                    href="#onb-directions"
                    eventName={ANALYTICS_EVENT_NAMES.heroCtaClick}
                    eventPayload={{ module: "start", cta_label: "Начать подбор" }}
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

                <div id="onb-directions" className="home-direction-select">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#6b7180]">Выберите направление</p>
                  <div className="segment-group mt-2">
                    {directionLinks.map((item) => (
                      <TrackedLink
                        key={item.href}
                        href={item.href}
                        eventName={ANALYTICS_EVENT_NAMES.heroCtaClick}
                        eventPayload={{ module: item.module, cta_label: item.label }}
                        className="segment-item"
                      >
                        {item.label}
                      </TrackedLink>
                    ))}
                  </div>
                </div>

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
                </div>
              </aside>
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
