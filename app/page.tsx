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
    benefit: "Помогает купить нужный размер с первого раза.",
    instant: "Сразу увидите вероятный размер и основной риск.",
    href: SCENARIOS["fashion-size"].route,
    price: SCENARIOS["fashion-size"].priceRub
  },
  {
    title: "Подбор для дома",
    benefit: "Помогает собрать комнату без лишних трат.",
    instant: "Сразу увидите тип набора и бюджетный вектор.",
    href: SCENARIOS["home-room-set"].route,
    price: SCENARIOS["home-room-set"].priceRub
  },
  {
    title: "Подбор ухода",
    benefit: "Помогает выбрать понятный уход без перегруза.",
    instant: "Сразу увидите общий формат ухода и фокус.",
    href: SCENARIOS["beauty-routine"].route,
    price: SCENARIOS["beauty-routine"].priceRub
  }
];

const howItWorks = [
  "Выберите, что хотите подобрать",
  "Ответьте на несколько коротких вопросов",
  "Получите предварительный вывод",
  "При необходимости откройте полный разбор после оплаты"
];

const fullReviewIncludes = [
  "Персональные рекомендации",
  "Понятные варианты выбора",
  "Пошаговый план перед покупкой",
  "PDF и код доступа"
];

const situations = [
  "Не уверены в размере куртки или худи",
  "Хотите собрать спальню в заданный бюджет",
  "Нужно упростить уход для чувствительной кожи"
];

const faqPreview = [
  "Нужна ли регистрация?",
  "Сколько времени занимает первый шаг?",
  "Чем предварительный вывод отличается от полного разбора?",
  "Как работает код доступа?"
];

export default function HomePage() {
  return (
    <>
      <HomeOnboardingGuide />

      <div className="space-y-10 sm:space-y-12">
        <section className="hero-shell relative overflow-hidden rounded-[2rem] px-6 py-12 sm:px-10 sm:py-14">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#e8d7c4]/70 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-16 -left-14 h-48 w-48 rounded-full bg-[#e9e0d3]/80 blur-3xl" aria-hidden="true" />

          <div className="relative grid gap-7 lg:grid-cols-[1.2fr_0.85fr] lg:items-center">
            <div className="space-y-6">
              <p className="pill inline-flex">AI Shopping</p>
              <h1 className="display-title max-w-4xl text-balance">Поможем выбрать покупку и не ошибиться</h1>
              <p className="max-w-3xl text-base text-[#5f554a] sm:text-lg">
                Для тех, кто не хочет тратить время на сомнения. Заполните короткую форму и получите первый вывод меньше чем за минуту.
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
                <span className="chip">Без email и телефона</span>
                <span className="chip">Код доступа после оплаты</span>
              </div>
            </div>

            <aside id="onb-quick-info" className="hero-card p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-[#726757]">Что вы увидите сразу</p>
              <ul className="mt-3 space-y-2 text-sm text-[#584c3d]">
                <li>- Короткий предварительный вывод по вашей задаче</li>
                <li>- Основной риск, который стоит проверить перед покупкой</li>
                <li>- Понимание, нужен ли полный разбор</li>
              </ul>
              <p className="mt-4 text-sm font-medium text-[#3a2f22]">Обычно первый шаг занимает меньше минуты.</p>
            </aside>
          </div>
        </section>

        <section id="onb-directions" className="space-y-4">
          <h2 className="section-title">Выберите направление</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {directions.map((card) => (
              <article key={card.title} className="product-card p-6">
                <h3 className="text-lg font-semibold text-[#2f251b]">{card.title}</h3>
                <p className="mt-2 text-sm text-[#5f5345]">{card.benefit}</p>
                <p className="mt-3 text-sm text-[#4e4233]">{card.instant}</p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[#6a5d4f]">от {card.price} RUB</p>
                  <Link href={card.href} className="button-secondary">
                    Начать
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="surface p-6 sm:p-8">
          <h2 className="section-title">Как это работает</h2>
          <ol className="mt-4 grid gap-3 md:grid-cols-2">
            {howItWorks.map((step, index) => (
              <li key={step} className="rounded-xl border border-[#dcccba] bg-white p-4 text-sm text-[#504434]">
                <p className="text-xs uppercase tracking-[0.14em] text-[#786a58]">Шаг {index + 1}</p>
                <p className="mt-1.5">{step}</p>
              </li>
            ))}
          </ol>
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

        <section className="surface p-6 sm:p-8">
          <h2 className="section-title">Примеры ситуаций</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {situations.map((item) => (
              <article key={item} className="rounded-xl border border-[#dcccba] bg-white p-4 text-sm text-[#4e4233]">
                {item}
              </article>
            ))}
          </div>
        </section>

        <section className="surface-muted p-6 sm:p-8">
          <h2 className="section-title">FAQ</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {faqPreview.map((question) => (
              <article key={question} className="rounded-xl border border-[#dcccba] bg-white p-4 text-sm text-[#4f4334]">
                {question}
              </article>
            ))}
          </div>
          <Link href="/faq" className="button-secondary mt-5 inline-flex">
            Смотреть все вопросы
          </Link>
        </section>

        <section className="surface-muted p-6 text-sm text-[#615546]">
          <p>{legalDisclaimer}</p>
          <p className="mt-2">{beautyDisclaimer}</p>
        </section>
      </div>
    </>
  );
}
