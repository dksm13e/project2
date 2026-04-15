import Link from "next/link";
import { SCENARIOS } from "@/lib/scenarios";
import { beautyDisclaimer, legalDisclaimer } from "@/lib/content";
import { TrackedLink } from "@/components/TrackedLink";
import { ANALYTICS_EVENT_NAMES } from "@/lib/analytics";
import { HomeOnboardingGuide } from "@/components/HomeOnboardingGuide";
import { AiFeatureImage } from "@/components/AiFeatureImage";
import { HomeStyleGallery } from "@/components/HomeStyleGallery";

const heroCtas = [
  { label: "Начать с одежды", href: "#section-clothing", module: "fashion" },
  { label: "Начать с дома", href: "#section-home", module: "home" },
  { label: "Начать с ухода", href: "#section-beauty", module: "beauty" }
];

const directionAnchors = [
  {
    id: "section-clothing",
    title: "Подбор размера одежды",
    lead: "Чтобы не ошибиться с размером и посадкой."
  },
  {
    id: "section-home",
    title: "Подбор для дома",
    lead: "Чтобы собрать интерьер спокойно и без хаоса."
  },
  {
    id: "section-beauty",
    title: "Подбор ухода",
    lead: "Чтобы получить рабочую схему без перегруза."
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
  "Главная рекомендация с объяснением логики выбора",
  "Альтернативы под ваш бюджет и приоритеты",
  "Риски и точки проверки до покупки",
  "Чёткий план действий в несколько шагов",
  "PDF-версия результата для сохранения",
  "Код доступа для повторного открытия"
];

const usefulCases = [
  "Покупаете вещь онлайн и не хотите ошибиться с посадкой.",
  "Планируете обновить комнату и не выйти за рамки бюджета.",
  "Хотите упростить уход и убрать лишние шаги.",
  "Нужно быстро принять решение, но без покупки вслепую."
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

      <div className="space-y-14 sm:space-y-16">
        <section className="hero-shell relative overflow-hidden rounded-[2.4rem] px-6 py-12 sm:px-10 sm:py-16">
          <div className="absolute -left-16 -top-20 h-52 w-52 rounded-full bg-[#e7d8ca]/75 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-[#ece1d3]/70 blur-3xl" aria-hidden="true" />

          <div className="relative grid gap-9 lg:grid-cols-[1.06fr_0.94fr] lg:items-center">
            <div className="space-y-7">
              <p className="pill inline-flex">Личный цифровой советник по покупкам</p>
              <h1 className="display-title max-w-4xl text-balance">Выбирайте уверенно. Покупайте без ошибок.</h1>
              <p className="max-w-3xl text-lg text-[#5d5247]">
                Помогаем принять решение до покупки: одежда, дом и уход. Первый вывод вы получите сразу, полный разбор откроете только при необходимости.
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

              <p className="text-sm text-[#685c4f]">Без регистрации • Без номера телефона • Код доступа после оплаты</p>
            </div>

            <aside id="onb-quick-info" className="hero-stage p-4 sm:p-5">
              <AiFeatureImage
                featureKind="home-preview"
                alt="Визуальный срез результата"
                className="h-52 w-full rounded-2xl object-cover sm:h-60"
              />
              <div className="hero-stage-overlay">
                <p className="text-xs uppercase tracking-[0.16em] text-[#7f6f5e]">Срез результата</p>
                <p className="mt-2 text-base font-medium text-[#2f241b]">Рекомендация + риск + следующий шаг</p>
                <p className="mt-2 text-sm text-[#5c4f40]">Данные собраны в удобный формат для решения перед покупкой.</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-[#5f5345]">
                  <span className="hero-metric">~ 1 минута</span>
                  <span className="hero-metric">3 направления</span>
                  <span className="hero-metric">PDF + код</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section id="onb-directions" className="surface p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="pill inline-flex">Направления</p>
              <h2 className="section-title mt-3">С чего начать</h2>
            </div>
            <p className="max-w-xl text-sm text-[#675a4d]">Выберите нужное направление и прокрутите к нему — на главной уже есть краткий ориентир по каждому пути.</p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {directionAnchors.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="direction-tile p-5">
                <p className="text-lg font-semibold text-[#2d231a]">{item.title}</p>
                <p className="mt-2 text-sm text-[#625648]">{item.lead}</p>
                <span className="mt-4 inline-flex text-sm font-medium text-[#46372a]">Открыть блок ↓</span>
              </a>
            ))}
          </div>
        </section>

        <section className="how-flow-shell p-6 sm:p-8">
          <h2 className="section-title">Как это работает</h2>
          <div className="relative mt-6">
            <div className="pointer-events-none absolute left-[10%] right-[10%] top-10 hidden h-px bg-[#d5c8b8] md:block" aria-hidden="true" />
            <ol className="grid gap-3 md:grid-cols-4">
              {howItWorksSteps.map((step, index) => (
                <li key={step.title} className={`how-flow-step p-4 text-sm ${index === 2 ? "how-flow-step-active" : ""}`}>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7c6b59]">Шаг {index + 1}</p>
                  <span className="flow-icon mt-2">{step.icon}</span>
                  <p className="mt-2 font-medium text-[#2e241b]">{step.title}</p>
                  <p className="mt-1.5 text-[#605347]">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-5 rounded-xl bg-white px-4 py-3 text-sm text-[#5f5245]">
            Без регистрации • Бесплатный предварительный вывод • Полный разбор только по желанию
          </p>
        </section>

        <section id="section-clothing" className="module-spotlight module-spotlight-fashion">
          <div className="module-spotlight-grid">
            <div>
              <p className="pill inline-flex">Одежда</p>
              <h2 className="section-title mt-3">Подбор размера одежды</h2>
              <p className="mt-3 text-sm text-[#605447]">
                Получите понятный вывод по размеру и посадке перед заказом, чтобы снизить риск возврата.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[#534638]">
                <li>- Сразу: вероятный размер и ключевой риск</li>
                <li>- После оплаты: полный разбор по зонам посадки и материалу</li>
              </ul>
              <Link href={SCENARIOS["fashion-size"].route} className="button-primary mt-6 inline-flex">
                Открыть форму одежды
              </Link>
            </div>
            <div className="module-visual-card">
              <AiFeatureImage
                featureKind="fashion-preview"
                alt="Подбор размера одежды"
                className="h-56 w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </section>

        <section id="section-home" className="module-spotlight module-spotlight-home">
          <div className="module-spotlight-grid">
            <div>
              <p className="pill inline-flex">Дом</p>
              <h2 className="section-title mt-3">Подбор для дома</h2>
              <p className="mt-3 text-sm text-[#605447]">
                Самый визуальный путь: добавьте фото комнаты, референса и мебели, чтобы получить более точный план покупок.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[#534638]">
                <li>- Сразу: стартовый набор и стильный вектор</li>
                <li>- После оплаты: must-have / optional / later-buy с бюджетной логикой</li>
                <li>- Фото-контекст учитывается в интерпретации</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={SCENARIOS["home-room-set"].route} className="button-primary">
                  Открыть форму для дома
                </Link>
                <span className="module-note">Фото повышают точность разбора</span>
              </div>
            </div>
            <div className="module-visual-card">
              <AiFeatureImage
                featureKind="home-preview"
                alt="Подбор для дома"
                className="h-56 w-full rounded-2xl object-cover"
              />
            </div>
          </div>
          <div className="mt-7">
            <HomeStyleGallery />
          </div>
        </section>

        <section id="section-beauty" className="module-spotlight module-spotlight-beauty">
          <div className="module-spotlight-grid">
            <div>
              <p className="pill inline-flex">Уход</p>
              <h2 className="section-title mt-3">Подбор ухода</h2>
              <p className="mt-3 text-sm text-[#605447]">
                Поможем собрать спокойную и понятную схему ухода под чувствительность, задачи и бюджет.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[#534638]">
                <li>- Сразу: фокус и безопасный следующий шаг</li>
                <li>- После оплаты: структура AM/PM, конфликтующие сочетания и план ввода</li>
              </ul>
              <Link href={SCENARIOS["beauty-routine"].route} className="button-primary mt-6 inline-flex">
                Открыть форму ухода
              </Link>
            </div>
            <div className="module-visual-card">
              <AiFeatureImage
                featureKind="beauty-preview"
                alt="Подбор ухода"
                className="h-56 w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </section>

        <section className="surface-muted p-6 sm:p-8">
          <h2 className="section-title">Когда это полезно</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {usefulCases.map((item) => (
              <article key={item} className="rounded-2xl bg-white px-4 py-4 text-sm text-[#4f4337] shadow-[0_1px_1px_rgba(27,20,12,0.05)]">
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

        <section className="rounded-2xl border border-[#d9cfc3] bg-[#faf5ee] p-6 text-sm text-[#605447]">
          <p>{legalDisclaimer}</p>
          <p className="mt-2">{beautyDisclaimer}</p>
        </section>
      </div>
    </>
  );
}
