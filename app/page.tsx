import Link from "next/link";
import { SCENARIOS } from "@/lib/scenarios";
import { beautyDisclaimer, legalDisclaimer } from "@/lib/content";
import { TrackedLink } from "@/components/TrackedLink";
import { ANALYTICS_EVENT_NAMES } from "@/lib/analytics";
import { HomeOnboardingGuide } from "@/components/HomeOnboardingGuide";
import { AiFeatureImage } from "@/components/AiFeatureImage";

const heroCtas = [
  { label: "Начать с одежды", href: "/fashion/size", module: "fashion" },
  { label: "Начать с дома", href: "/home/room-set", module: "home" },
  { label: "Начать с ухода", href: "/beauty/routine", module: "beauty" }
];

const directions = [
  {
    title: "Подбор размера одежды",
    benefit: "Поймёте, какой размер брать перед заказом.",
    instant: "Сразу увидите вероятный размер и главный риск посадки.",
    cta: "Попробовать одежду",
    href: SCENARIOS["fashion-size"].route,
    highlight: "Одежда"
  },
  {
    title: "Подбор для дома",
    benefit: "Соберёте комнату без лишних покупок и перегруза.",
    instant: "Сразу увидите стартовый набор, стиль и бюджетный вектор.",
    cta: "Попробовать дом",
    href: SCENARIOS["home-room-set"].route,
    highlight: "Дом",
    photoFocus: "Загрузите фото комнаты, референса и текущей мебели: так подбор для дома точнее."
  },
  {
    title: "Подбор ухода",
    benefit: "Соберёте понятный уход без лишних банок.",
    instant: "Сразу увидите фокус ухода и безопасный следующий шаг.",
    cta: "Попробовать уход",
    href: SCENARIOS["beauty-routine"].route,
    highlight: "Уход"
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
  "Разбор вашей ситуации, а не общий шаблон",
  "Подробные рекомендации с альтернативами",
  "Риски, которые важно проверить до оплаты товара",
  "Пошаговый план действий перед покупкой",
  "PDF, который можно сохранить и пересмотреть",
  "Код доступа для повторного открытия результата"
];

const usefulCases = [
  "Сомневаетесь, какой размер брать онлайн и не хотите возврат.",
  "Планируете обновить комнату и хотите уложиться в бюджет.",
  "Уход перегружен, а хочется спокойной и рабочей схемы.",
  "Нужно быстро принять решение перед покупкой, без долгого сравнения."
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

      <div className="space-y-10 sm:space-y-14">
        <section className="hero-shell relative overflow-hidden rounded-[2.2rem] px-6 py-12 sm:px-10 sm:py-14">
          <div className="absolute -left-24 -top-20 h-52 w-52 rounded-full bg-[#e9ddd0]/80 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-[#ece0d2]/70 blur-3xl" aria-hidden="true" />

          <div className="relative grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
            <div className="space-y-6">
              <p className="pill inline-flex">Личный цифровой советник по покупкам</p>
              <p className="text-xs uppercase tracking-[0.22em] text-[#7d6f60]">Выбирайте уверенно. Покупайте без ошибок.</p>
              <h1 className="display-title max-w-4xl text-balance">Поймите, что покупать именно вам, ещё до оплаты товара</h1>
              <p className="max-w-3xl text-base text-[#5d5247] sm:text-lg">
                Ответьте на несколько вопросов и получите первый вывод меньше чем за минуту. Если нужен более глубокий разбор, откройте его позже.
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

              <p className="text-sm text-[#66594d]">
                Без регистрации • Без номера телефона • Код доступа после оплаты
              </p>
            </div>

            <aside id="onb-quick-info" className="hero-snapshot p-4 sm:p-5">
              <AiFeatureImage
                featureKind="home-preview"
                alt="Снимок результата сервиса"
                className="h-44 w-full rounded-2xl border border-[#d7ccbf] object-cover sm:h-52"
              />

              <div className="mt-4 rounded-2xl border border-[#d8ccbe] bg-white/95 p-4 shadow-[0_6px_18px_rgba(30,22,15,0.08)]">
                <p className="text-xs uppercase tracking-[0.16em] text-[#7b6b5a]">Снимок результата</p>
                <div className="mt-3 grid gap-2 text-sm text-[#4b4035]">
                  <p className="rounded-lg bg-[#f8f2ea] px-3 py-2">Ключевая рекомендация по вашей задаче</p>
                  <p className="rounded-lg bg-[#f8f2ea] px-3 py-2">Один риск, который важно проверить</p>
                  <p className="rounded-lg bg-[#f8f2ea] px-3 py-2">Следующий шаг перед покупкой</p>
                </div>
              </div>

              <p className="mt-4 rounded-xl border border-[#d9cdbf] bg-[#f5ede3] px-3 py-2 text-sm text-[#4f4337]">
                Для подбора для дома можно добавить фото комнаты, референса и мебели. Это заметно повышает точность.
              </p>
            </aside>
          </div>
        </section>

        <section className="how-flow-shell p-6 sm:p-8">
          <h2 className="section-title">Как это работает</h2>
          <div className="relative mt-6">
            <div className="pointer-events-none absolute left-[10%] right-[10%] top-10 hidden h-px bg-[#d4c7b7] md:block" aria-hidden="true" />
            <ol className="grid gap-3 md:grid-cols-4">
              {howItWorksSteps.map((step, index) => (
                <li key={step.title} className={`how-flow-step p-4 text-sm ${index === 2 ? "how-flow-step-active" : ""}`}>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7a6a58]">Шаг {index + 1}</p>
                  <span className="flow-icon mt-2">{step.icon}</span>
                  <p className="mt-2 font-medium text-[#2b2118]">{step.title}</p>
                  <p className="mt-1.5 text-[#605347]">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-5 rounded-xl bg-white px-4 py-3 text-sm text-[#5f5245]">
            Без регистрации • Бесплатный предварительный вывод • Полный разбор по желанию
          </p>
        </section>

        <section id="onb-directions" className="space-y-5">
          <h2 className="section-title">Выберите направление</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {directions.map((card) => (
              <article
                key={card.title}
                className={`direction-tile p-6 ${card.highlight === "Дом" ? "direction-tile-home" : ""}`}
              >
                <p className="text-xs uppercase tracking-[0.18em] text-[#7b6c5d]">{card.highlight}</p>
                <h3 className="mt-2 text-lg font-semibold text-[#2f241b]">{card.title}</h3>
                <p className="mt-2 text-sm text-[#605346]">{card.benefit}</p>
                <p className="mt-4 rounded-xl bg-[#f8f2e9] px-3 py-2 text-sm text-[#4f4337]">{card.instant}</p>
                {card.photoFocus ? (
                  <p className="mt-3 rounded-xl border border-[#d7c9b8] bg-white px-3 py-2 text-sm text-[#4f4337]">{card.photoFocus}</p>
                ) : null}
                <Link href={card.href} className="button-secondary mt-5 inline-flex">
                  {card.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-muted p-6 sm:p-8">
          <h2 className="section-title">Когда это полезно</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {usefulCases.map((item) => (
              <article key={item} className="rounded-2xl bg-white px-4 py-4 text-sm text-[#4f4337] shadow-[0_1px_1px_rgba(27,20,12,0.04)]">
                {item}
              </article>
            ))}
          </div>
        </section>

        <section className="surface p-6 sm:p-8">
          <h2 className="section-title">Что даёт полный разбор</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {fullReviewIncludes.map((item) => (
              <li key={item} className="rounded-2xl border border-[#d9ccbe] bg-[#fffcf9] px-4 py-3 text-sm text-[#4f4336]">
                {item}
              </li>
            ))}
          </ul>
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

        <section className="rounded-2xl border border-[#d9cfc3] bg-[#f9f4ee] p-6 text-sm text-[#605447]">
          <p>{legalDisclaimer}</p>
          <p className="mt-2">{beautyDisclaimer}</p>
        </section>
      </div>
    </>
  );
}
