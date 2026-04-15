import Link from "next/link";
import { SCENARIOS } from "@/lib/scenarios";
import { beautyDisclaimer, legalDisclaimer } from "@/lib/content";
import { TrackedLink } from "@/components/TrackedLink";
import { ANALYTICS_EVENT_NAMES } from "@/lib/analytics";
import { HomeOnboardingGuide } from "@/components/HomeOnboardingGuide";

const heroCtas = [
  { label: "Подбор размера одежды", href: "/fashion/size", module: "fashion" },
  { label: "Подбор для дома", href: "/home/room-set", module: "home" },
  { label: "Подбор ухода", href: "/beauty/routine", module: "beauty" }
];

const directions = [
  {
    title: "Подбор размера одежды",
    benefit: "Чтобы не ошибиться с размером перед заказом.",
    instant: "Сразу: вероятный размер и один важный риск.",
    href: SCENARIOS["fashion-size"].route
  },
  {
    title: "Подбор для дома",
    benefit: "Чтобы собрать комнату спокойно и без лишних покупок.",
    instant: "Сразу: базовый набор и ориентир по бюджету.",
    href: SCENARIOS["home-room-set"].route
  },
  {
    title: "Подбор ухода",
    benefit: "Чтобы выстроить понятный уход без перегруза.",
    instant: "Сразу: основной фокус и первый шаг.",
    href: SCENARIOS["beauty-routine"].route
  }
];

const howItWorksSteps = [
  {
    title: "Выберите направление",
    text: "Одежда, дом или уход",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        <path d="M12 3v18M3 12h18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
      </svg>
    )
  },
  {
    title: "Ответьте на вопросы",
    text: "Это займёт около минуты",
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
    text: "Только если захотите больше деталей",
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

const fullReviewIncludes = [
  "Персональные рекомендации под ваш запрос",
  "Варианты выбора в зависимости от цели",
  "Пошаговый план перед покупкой",
  "PDF и код доступа"
];

const usefulCases = [
  "Когда сомневаетесь, какой размер брать онлайн",
  "Когда хотите обновить комнату и не выйти за бюджет",
  "Когда уход стал сложным и хочется упростить",
  "Когда нужно быстро принять решение перед покупкой"
];

const faqPreview = [
  {
    question: "Нужна ли регистрация?",
    answer: "Нет. Можно начать сразу, без аккаунта."
  },
  {
    question: "Первый шаг правда бесплатный?",
    answer: "Да. Сначала вы получаете бесплатный предварительный вывод."
  },
  {
    question: "Чем отличается полный разбор?",
    answer: "Он даёт детали, альтернативы, PDF и код доступа для повторного открытия."
  }
];

export default function HomePage() {
  return (
    <>
      <HomeOnboardingGuide />

      <div className="space-y-10 sm:space-y-12">
        <section className="hero-shell relative overflow-hidden rounded-[2rem] px-6 py-12 sm:px-10 sm:py-14">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#e8d8c8]/70 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-16 -left-14 h-48 w-48 rounded-full bg-[#eadfce]/80 blur-3xl" aria-hidden="true" />

          <div className="relative grid gap-7 lg:grid-cols-[1.2fr_0.85fr] lg:items-center">
            <div className="space-y-6">
              <p className="pill inline-flex">AI Shopping</p>
              <h1 className="display-title max-w-4xl text-balance">Поможем выбрать и не ошибиться с покупкой</h1>
              <p className="max-w-3xl text-base text-[#5f554a] sm:text-lg">
                Ответьте на несколько вопросов и получите первый вывод меньше чем за минуту. Полный разбор открывается только если он вам нужен.
              </p>

              <div className="flex flex-wrap gap-3">
                {heroCtas.map((cta, index) => (
                  <TrackedLink
                    key={cta.href}
                    href={cta.href}
                    eventName={ANALYTICS_EVENT_NAMES.heroCtaClick}
                    eventPayload={{ module: cta.module, cta_label: cta.label }}
                    id={index === 0 ? "onb-start-btn" : undefined}
                    className={index === 0 ? "button-primary" : "button-secondary"}
                  >
                    {cta.label}
                  </TrackedLink>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                <span className="chip">Без регистрации</span>
                <span className="chip">Без номера телефона</span>
                <span className="chip">Бесплатный предварительный вывод</span>
                <span className="chip">Код доступа после оплаты</span>
              </div>
            </div>

            <aside id="onb-quick-info" className="hero-card p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-[#726757]">Пример первого вывода</p>
              <ul className="mt-3 space-y-2 text-sm text-[#584c3d]">
                <li>- Одна основная рекомендация по вашей задаче</li>
                <li>- Один риск, который важно проверить</li>
                <li>- Понятный следующий шаг перед покупкой</li>
              </ul>
              <p className="mt-4 text-sm font-medium text-[#3a2f22]">Полный разбор открывается по желанию.</p>
            </aside>
          </div>
        </section>

        <section id="onb-directions" className="space-y-4">
          <h2 className="section-title">Выберите направление</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {directions.map((card) => (
              <article key={card.title} className="product-card direction-card p-6">
                <h3 className="text-lg font-semibold text-[#2f251b]">{card.title}</h3>
                <p className="mt-2 text-sm text-[#5f5345]">{card.benefit}</p>
                <p className="mt-3 rounded-lg border border-[#dfd5ca] bg-[#fffaf4] px-3 py-2 text-sm text-[#4e4233]">{card.instant}</p>
                <Link href={card.href} className="button-secondary mt-5 inline-flex">
                  Попробовать
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="flow-shell p-6 sm:p-8">
          <h2 className="section-title">Как это работает</h2>
          <div className="relative mt-5">
            <div className="pointer-events-none absolute left-[10%] right-[10%] top-8 hidden h-px bg-[#d9cec2] md:block" aria-hidden="true" />
            <ol className="grid gap-3 md:grid-cols-4">
              {howItWorksSteps.map((step, index) => (
                <li key={step.title} className={`flow-step p-4 text-sm text-[#504434] ${index === 2 ? "flow-step-highlight" : ""}`}>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#786a58]">Шаг {index + 1}</p>
                  <span className="flow-icon mt-2">{step.icon}</span>
                  <p className="mt-2 font-medium text-[#2f251a]">{step.title}</p>
                  <p className="mt-1.5 text-[#655848]">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-5 rounded-xl border border-[#ddd2c7] bg-white px-4 py-3 text-sm text-[#5d5041]">
            Без регистрации • Бесплатный предварительный вывод • Полный разбор по желанию
          </div>
        </section>

        <section className="surface p-6 sm:p-8">
          <h2 className="section-title">Что входит в полный разбор</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-[#4f4334]">
            {fullReviewIncludes.map((item) => (
              <li key={item} className="rounded-xl border border-[#dcccba] bg-white p-4">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-muted p-6 sm:p-8">
          <h2 className="section-title">Когда это полезно</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {usefulCases.map((item) => (
              <article key={item} className="rounded-xl border border-[#dcccba] bg-white p-4 text-sm text-[#4e4233]">
                {item}
              </article>
            ))}
          </div>
        </section>

        <section className="surface p-6 sm:p-8">
          <h2 className="section-title">FAQ</h2>
          <div className="mt-4 space-y-3">
            {faqPreview.map((item) => (
              <details key={item.question} className="faq-item px-4 py-3 text-sm text-[#4f4334]">
                <summary className="cursor-pointer list-none font-medium text-[#2f251a]">{item.question}</summary>
                <p className="mt-2 text-[#5e5142]">{item.answer}</p>
              </details>
            ))}
          </div>
          <Link href="/faq" className="button-secondary mt-5 inline-flex">
            Смотреть все вопросы
          </Link>
        </section>

        <section className="rounded-2xl border border-[#ddd3c8] bg-[#f8f4ef] p-6 text-sm text-[#615546]">
          <p>{legalDisclaimer}</p>
          <p className="mt-2">{beautyDisclaimer}</p>
        </section>
      </div>
    </>
  );
}

