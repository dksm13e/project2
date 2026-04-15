import Link from "next/link";
import { SCENARIOS } from "@/lib/scenarios";
import { beautyDisclaimer, legalDisclaimer } from "@/lib/content";
import { TrackedLink } from "@/components/TrackedLink";
import { ANALYTICS_EVENT_NAMES } from "@/lib/analytics";
import { HomeOnboardingGuide } from "@/components/HomeOnboardingGuide";
import { AiFeatureImage } from "@/components/AiFeatureImage";

const directionLinks = [
  { label: "Одежда", href: SCENARIOS["fashion-size"].route, module: "fashion" },
  { label: "Дом", href: SCENARIOS["home-room-set"].route, module: "home" },
  { label: "Уход", href: SCENARIOS["beauty-routine"].route, module: "beauty" }
];

const howItWorksSteps = [
  {
    title: "Выберите направление",
    text: "Одежда, дом или уход",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        <path d="M4 12h16M12 4v16" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
      </svg>
    )
  },
  {
    title: "Ответьте на вопросы",
    text: "Это займет меньше минуты",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        <path d="M5 6.5h14M5 12h14M5 17.5h9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
      </svg>
    )
  },
  {
    title: "Получите первый вывод",
    text: "Сразу увидите основную рекомендацию",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        <path
          d="M4 12.5l4.4 4.5L20 6.7"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    )
  },
  {
    title: "Откройте полный разбор",
    text: "Если нужны детали, риски и PDF",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        <path
          d="M8 10V8a4 4 0 1 1 8 0v2M6.5 10h11v9h-11z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </svg>
    )
  }
];

const usefulCases = [
  "Перед заказом одежды онлайн, когда важно не ошибиться с размером и посадкой.",
  "Перед покупкой для дома, когда нужно сохранить стиль и уложиться в бюджет.",
  "Перед обновлением ухода, когда хочется убрать лишние шаги и снизить риск реакции."
];

const trustItems = [
  {
    title: "Без регистрации",
    text: "Начинаете сразу, без личного кабинета и длинной настройки."
  },
  {
    title: "Без email и телефона",
    text: "Контактные данные не нужны для основного пользовательского пути."
  },
  {
    title: "Фото для дома",
    text: "В подборе для дома можно добавить фото комнаты, референса и мебели для более точного вывода."
  },
  {
    title: "Доступ по коду",
    text: "После оплаты результат можно открыть повторно по коду доступа."
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

      <div className="home-premium-root">
        <div className="home-atmosphere" aria-hidden="true">
          <span className="home-shape home-shape-fashion" />
          <span className="home-shape home-shape-home" />
          <span className="home-shape home-shape-beauty" />
          <span className="home-ink-line home-ink-line-a" />
          <span className="home-ink-line home-ink-line-b" />
        </div>

        <div className="home-content space-y-12 sm:space-y-14">
          <section className="home-hero-shell relative overflow-hidden rounded-[2.5rem] px-6 py-12 sm:px-10 sm:py-16">
            <div className="relative grid gap-9 lg:grid-cols-[1.03fr_0.97fr] lg:items-center">
              <div className="space-y-6">
                <p className="home-status-badge inline-flex">Private digital advisor</p>
                <p className="text-xs uppercase tracking-[0.2em] text-[#746b63]">Выбирайте уверенно. Покупайте без ошибок.</p>
                <h1 className="display-title max-w-4xl text-balance">Точное решение перед покупкой без лишнего риска</h1>
                <p className="max-w-2xl text-base text-[#5a5148] sm:text-lg">
                  Один сервис для одежды, дома и ухода. Сначала вы видите короткий предварительный вывод и
                  решаете, нужен ли полный разбор.
                </p>

                <div className="flex flex-wrap gap-3">
                  <TrackedLink
                    id="onb-start-btn"
                    href="#onb-directions"
                    eventName={ANALYTICS_EVENT_NAMES.heroCtaClick}
                    eventPayload={{ module: "start", cta_label: "Начать подбор" }}
                    className="button-primary"
                  >
                    Начать подбор
                  </TrackedLink>

                  <TrackedLink
                    href="#how-it-works"
                    eventName={ANALYTICS_EVENT_NAMES.heroCtaClick}
                    eventPayload={{ module: "flow", cta_label: "Как это работает" }}
                    className="button-secondary"
                  >
                    Как это работает
                  </TrackedLink>

                  <TrackedLink
                    href="/open-by-code"
                    eventName={ANALYTICS_EVENT_NAMES.heroCtaClick}
                    eventPayload={{ module: "access", cta_label: "Открыть по коду" }}
                    className="button-secondary"
                  >
                    Открыть по коду
                  </TrackedLink>
                </div>

                <div id="onb-directions" className="home-direction-strip">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#756b63]">Выберите направление</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {directionLinks.map((item) => (
                      <TrackedLink
                        key={item.href}
                        href={item.href}
                        eventName={ANALYTICS_EVENT_NAMES.heroCtaClick}
                        eventPayload={{ module: item.module, cta_label: item.label }}
                        className="home-direction-link"
                      >
                        {item.label}
                      </TrackedLink>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-[#6a6158]">Без регистрации • Без номера телефона • Код доступа после оплаты</p>
              </div>

              <aside id="onb-quick-info" className="home-preview-panel">
                <div className="home-preview-media">
                  <AiFeatureImage
                    featureKind="home-preview"
                    alt="Визуальный фрагмент сервиса"
                    className="h-[21rem] w-full rounded-[1rem] object-cover sm:h-[23rem]"
                  />
                </div>

                <div className="home-preview-sheet">
                  <p className="home-preview-label">Пример полного разбора</p>
                  <h3 className="home-preview-title">Рекомендованный размер: M</h3>
                  <p className="home-preview-subtitle">Альтернатива: L для свободной посадки</p>

                  <div className="home-preview-kpi">
                    <div>
                      <p className="home-preview-kpi-label">Уверенность</p>
                      <p className="home-preview-kpi-value">82%</p>
                    </div>
                    <div>
                      <p className="home-preview-kpi-label">Риск</p>
                      <p className="home-preview-kpi-value">средний</p>
                    </div>
                  </div>

                  <div className="home-preview-note">
                    <p className="home-preview-note-title">Что важно проверить</p>
                    <p className="home-preview-note-text">Запас по плечам и длину рукава в таблице бренда.</p>
                  </div>
                </div>

                <div className="home-preview-float home-preview-float-risk">
                  <p className="home-preview-float-label">Сигнал риска</p>
                  <p className="home-preview-float-text">Материал малорастяжимый</p>
                </div>
                <div className="home-preview-float home-preview-float-next">
                  <p className="home-preview-float-label">Следующий шаг</p>
                  <p className="home-preview-float-text">Сверить мерки изделия</p>
                </div>
              </aside>
            </div>
          </section>

          <section id="how-it-works" className="home-glass-panel p-6 sm:p-8">
            <h2 className="home-section-title">Как это работает</h2>
            <div className="relative mt-6">
              <div className="home-flow-line" aria-hidden="true" />
              <ol className="grid gap-3 md:grid-cols-4">
                {howItWorksSteps.map((step, index) => (
                  <li key={step.title} className={`home-step-card p-4 text-sm ${index === 2 ? "home-step-card-active" : ""}`}>
                    <p className="text-xs uppercase tracking-[0.16em] text-[#b8ada2]">Шаг {index + 1}</p>
                    <span className="home-flow-icon mt-2">{step.icon}</span>
                    <p className="mt-2 font-medium text-[#f3eee8]">{step.title}</p>
                    <p className="mt-1.5 text-[#c8beb4]">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="home-glass-panel-soft p-6 sm:p-8">
            <h2 className="home-section-title">Для чего это полезно</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {usefulCases.map((item) => (
                <article key={item} className="home-mini-card px-4 py-4 text-sm text-[#d6cdc4]">
                  {item}
                </article>
              ))}
            </div>
          </section>

          <section className="home-glass-panel p-6 sm:p-8">
            <h2 className="home-section-title">Почему нам доверяют</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {trustItems.map((item) => (
                <article key={item.title} className="home-trust-card px-4 py-4">
                  <p className="text-sm font-semibold text-[#f2ebe3]">{item.title}</p>
                  <p className="mt-2 text-sm text-[#c7bcaf]">{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="home-glass-panel p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="home-section-title">Частые вопросы</h2>
              <Link href="/faq" className="button-secondary">
                Смотреть все вопросы
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {faqPreview.map((item) => (
                <details key={item.question} className="home-faq-item px-4 py-3 text-sm">
                  <summary className="cursor-pointer list-none font-medium text-[#f1eae2]">{item.question}</summary>
                  <p className="mt-2 text-[#c8bcae]">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="home-disclaimer rounded-2xl p-6 text-sm text-[#bdb0a2]">
            <p>{legalDisclaimer}</p>
            <p className="mt-2">{beautyDisclaimer}</p>
          </section>
        </div>
      </div>
    </>
  );
}
