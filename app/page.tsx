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
    text: "Это займёт меньше минуты",
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
    text: "Только если нужны детали и PDF",
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
  "Перед заказом одежды онлайн, когда не хочется ошибиться с размером.",
  "Перед покупкой для дома, когда важно уложиться в бюджет и стиль.",
  "Перед обновлением ухода, когда хочется убрать лишние шаги."
];

const trustItems = [
  {
    title: "Без регистрации",
    text: "Начинаете сразу, без аккаунта и длинных форм."
  },
  {
    title: "Без email и телефона",
    text: "Контактные данные не нужны в основном пользовательском пути."
  },
  {
    title: "Фото для дома",
    text: "В подборе для дома можно добавить фото комнаты, референса и мебели для более точного вывода."
  },
  {
    title: "Повторный доступ по коду",
    text: "После оплаты результат можно открыть снова по коду доступа."
  }
];

const faqPreview = [
  {
    question: "Нужна ли регистрация?",
    answer: "Нет. Сервис работает без личного кабинета."
  },
  {
    question: "Сначала можно попробовать бесплатно?",
    answer: "Да. Сначала вы получаете предварительный вывод."
  },
  {
    question: "Что даёт полный разбор?",
    answer: "Подробные рекомендации, риски, альтернативы, PDF и код доступа."
  }
];

export default function HomePage() {
  return (
    <>
      <HomeOnboardingGuide />

      <div className="space-y-12 sm:space-y-14">
        <section className="hero-shell relative overflow-hidden rounded-[2.5rem] px-6 py-12 sm:px-10 sm:py-16">
          <div className="absolute -left-16 -top-20 h-52 w-52 rounded-full bg-[#e9dac9]/72 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-[#ede0d0]/68 blur-3xl" aria-hidden="true" />

          <div className="relative grid gap-8 lg:grid-cols-[1.03fr_0.97fr] lg:items-center">
            <div className="space-y-6">
              <p className="pill inline-flex">Персональный цифровой советник</p>
              <p className="text-xs uppercase tracking-[0.2em] text-[#7a6b5b]">Выбирайте уверенно. Покупайте без ошибок.</p>
              <h1 className="display-title max-w-4xl text-balance">Помогаем принять решение до покупки</h1>
              <p className="max-w-2xl text-base text-[#5f5346] sm:text-lg">
                Одежда, дом и уход в одном сервисе. Сначала вы видите короткий предварительный вывод и решаете, нужен ли полный разбор.
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

              <div id="onb-directions" className="hero-direction-strip">
                <p className="text-xs uppercase tracking-[0.16em] text-[#7c6d5d]">Выберите направление</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {directionLinks.map((item) => (
                    <TrackedLink
                      key={item.href}
                      href={item.href}
                      eventName={ANALYTICS_EVENT_NAMES.heroCtaClick}
                      eventPayload={{ module: item.module, cta_label: item.label }}
                      className="hero-direction-link"
                    >
                      {item.label}
                    </TrackedLink>
                  ))}
                </div>
              </div>

              <p className="text-sm text-[#6a5d50]">Без регистрации • Без номера телефона • Код доступа после оплаты</p>
            </div>

            <aside id="onb-quick-info" className="hero-visual-panel">
              <AiFeatureImage
                featureKind="home-preview"
                alt="Премиальный визуальный срез сервиса"
                className="h-[21rem] w-full rounded-[1.2rem] object-cover sm:h-[23rem]"
              />

              <div className="hero-panel-chip hero-panel-chip-a">
                <p className="text-xs uppercase tracking-[0.12em] text-[#7d6d5c]">Фокус</p>
                <p className="mt-1 text-sm font-medium text-[#2f241a]">Рекомендация по вашей задаче</p>
              </div>

              <div className="hero-panel-chip hero-panel-chip-b">
                <p className="text-xs uppercase tracking-[0.12em] text-[#7d6d5c]">Сигнал риска</p>
                <p className="mt-1 text-sm font-medium text-[#2f241a]">Что проверить до покупки</p>
              </div>
            </aside>
          </div>
        </section>

        <section id="how-it-works" className="how-flow-shell p-6 sm:p-8">
          <h2 className="section-title">Как это работает</h2>
          <div className="relative mt-6">
            <div className="pointer-events-none absolute left-[10%] right-[10%] top-10 hidden h-px bg-[#d5c8b8] md:block" aria-hidden="true" />
            <ol className="grid gap-3 md:grid-cols-4">
              {howItWorksSteps.map((step, index) => (
                <li key={step.title} className={`how-flow-step p-4 text-sm ${index === 2 ? "how-flow-step-active" : ""}`}>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7b6a58]">Шаг {index + 1}</p>
                  <span className="flow-icon mt-2">{step.icon}</span>
                  <p className="mt-2 font-medium text-[#2e241b]">{step.title}</p>
                  <p className="mt-1.5 text-[#605347]">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="surface-muted p-6 sm:p-8">
          <h2 className="section-title">Для чего это полезно</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {usefulCases.map((item) => (
              <article key={item} className="rounded-2xl bg-white px-4 py-4 text-sm text-[#4f4337] shadow-[0_1px_1px_rgba(27,20,12,0.05)]">
                {item}
              </article>
            ))}
          </div>
        </section>

        <section className="surface p-6 sm:p-8">
          <h2 className="section-title">Почему нам доверяют</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {trustItems.map((item) => (
              <article key={item.title} className="rounded-2xl border border-[#d8cbbb] bg-[#fffdf9] px-4 py-4">
                <p className="text-sm font-semibold text-[#2f241b]">{item.title}</p>
                <p className="mt-2 text-sm text-[#5c4f40]">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="surface p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-title">Частые вопросы</h2>
            <Link href="/faq" className="button-secondary">
              Смотреть все вопросы
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {faqPreview.map((item) => (
              <details key={item.question} className="faq-item px-4 py-3 text-sm text-[#4f4334]">
                <summary className="cursor-pointer list-none font-medium text-[#2f251a]">{item.question}</summary>
                <p className="mt-2 text-[#5e5142]">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#d9cfc3] bg-[#faf5ee] p-6 text-sm text-[#605447]">
          <p>{legalDisclaimer}</p>
          <p className="mt-2">{beautyDisclaimer}</p>
        </section>
      </div>
    </>
  );
}
