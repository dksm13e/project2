import Link from "next/link";
import { SCENARIOS } from "@/lib/scenarios";
import { ModulePageTracker } from "@/components/ModulePageTracker";
import { BeautyEntryScenarios } from "@/components/BeautyEntryScenarios";

const option = SCENARIOS["beauty-routine"];

const beautyFormats = [
  {
    title: "Базовая схема ухода",
    explanation: "Спокойный стартовый каркас без лишних шагов и резких активов.",
    firstLook: ["Базовый формат ухода", "Главный фокус ухода", "Один риск перегруза"],
    fullLook: ["Пошаговый порядок утро/вечер", "Что оставить в основе", "Как не перегрузить кожу"],
    goodFor: ["Нужна понятная база", "Путаетесь в шагах", "Хотите аккуратный старт"]
  },
  {
    title: "Упрощение текущего ухода",
    explanation: "Помогаем убрать дубли и оставить то, что реально работает.",
    firstLook: ["Что уже лишнее", "Что можно оставить", "Где риск конфликтов"],
    fullLook: ["Что убрать и почему", "Что не смешивать", "Как упростить схему без потери пользы"],
    goodFor: ["Слишком много банок", "Схема устала и не радует", "Нужно меньше, но лучше"]
  },
  {
    title: "Осторожное добавление новых шагов",
    explanation: "Добавляем новые средства в безопасном порядке и темпе.",
    firstLook: ["Подходит ли ввод новых шагов сейчас", "Один ключевой риск реакции", "С чего начать"],
    fullLook: ["Порядок ввода по неделям", "С чем не сочетать", "Когда остановиться и упростить"],
    goodFor: ["Хотите добавить активы без спешки", "Есть чувствительность", "Нужен контролируемый план"]
  }
];

export default function BeautyPage() {
  return (
    <section className="premium-page space-y-6">
      <ModulePageTracker module="beauty" page="module" />

      <header className="premium-page-header">
        <p className="premium-kicker">Уход</p>
        <h1 className="premium-title">Спокойная схема ухода под вашу кожу</h1>
        <p className="premium-subtitle">
          Помогаем убрать лишнее, сохранить рабочую базу и аккуратно вводить новые шаги без перегруза.
        </p>
      </header>

      <BeautyEntryScenarios />

      <article className="premium-section p-6 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <div className="premium-note p-5">
            <p className="premium-stat">Сначала вы увидите</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1f2a39]">Первый ориентир по уходу до оплаты</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#5d6a80]">
              <li>- Базовый формат ухода под ваш ввод.</li>
              <li>- Главный фокус по состоянию кожи.</li>
              <li>- Один риск перегруза или несовместимости.</li>
            </ul>
          </div>

          <div className="premium-note p-5">
            <p className="premium-stat">После оплаты</p>
            <p className="mt-2 text-sm text-[#5d6a80]">
              Спокойный структурный разбор: утро/вечер по шагам, что оставить, что убрать, что не смешивать и как
              аккуратно вводить новые средства.
            </p>
            <p className="mt-3 text-xs text-[#6b7790]">Разовый продукт без подписки</p>
          </div>
        </div>
      </article>

      <section className="premium-section p-6 sm:p-8">
        <h2 className="section-title">Форматы внутри направления “Уход”</h2>
        <p className="mt-2 text-sm text-[#5e6a7d]">
          Формат определяет логику разбора: от спокойной базы до аккуратного введения новых шагов.
        </p>

        <div className="premium-grid-cards premium-grid-cards-2 mt-5 xl:grid-cols-3">
          {beautyFormats.map((format) => (
            <article key={format.title} className="premium-card p-5">
              <h3 className="text-[1.2rem] font-semibold text-[#1f2939]">{format.title}</h3>
              <p className="mt-2 text-sm text-[#5d6a7f]">{format.explanation}</p>

              <div className="premium-note mt-4 p-4 text-sm">
                <p className="font-medium text-[#2b3748]">Сначала вы увидите</p>
                <ul className="mt-2 space-y-1.5 text-[#5d6a7f]">
                  {format.firstLook.map((line) => (
                    <li key={line}>- {line}</li>
                  ))}
                </ul>
              </div>

              <div className="premium-note mt-3 p-4 text-sm">
                <p className="font-medium text-[#2b3748]">В полном разборе</p>
                <ul className="mt-2 space-y-1.5 text-[#5d6a7f]">
                  {format.fullLook.map((line) => (
                    <li key={line}>- {line}</li>
                  ))}
                </ul>
              </div>

              <div className="premium-note mt-3 p-4 text-sm">
                <p className="font-medium text-[#2b3748]">Подходит, если</p>
                <ul className="mt-2 space-y-1.5 text-[#5d6a7f]">
                  {format.goodFor.map((line) => (
                    <li key={line}>- {line}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="premium-grid-cards premium-grid-cards-2">
        <article className="premium-card p-5 sm:p-6">
          <p className="premium-stat">Предварительный вывод</p>
          <h3 className="mt-3 text-[1.32rem] font-semibold leading-tight text-[#1f2939]">Что увидите сразу</h3>
          <p className="mt-2 text-sm text-[#5e6a7d]">{option.weakOutcome}</p>
        </article>

        <article className="premium-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <p className="premium-stat">Полный разбор</p>
            <span className="rounded-full border border-[#c6d3e5] bg-white px-3 py-1 text-xs font-medium text-[#415069]">
              от {option.priceRub} RUB
            </span>
          </div>
          <h3 className="mt-3 text-[1.32rem] font-semibold leading-tight text-[#1f2939]">После оплаты</h3>
          <p className="mt-2 text-sm text-[#5e6a7d]">{option.fullOutcome}</p>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-[0.14em] text-[#6f7b8f]">Разовый доступ</span>
            <Link className="button-primary" href={option.route}>
              Начать
            </Link>
          </div>
        </article>
      </div>

      <article className="premium-note p-5 text-sm text-[#5d6a80]">
        Результат строится по вашему вводу: тип кожи, чувствительность, текущие средства и ограничения по активам.
        Поэтому рекомендации остаются спокойными и прикладными, без перегруженных схем.
      </article>

      <article className="premium-note p-4 text-sm text-[#5f6f84]">
        Это информационный разбор ухода, а не медицинское назначение.
      </article>

      <div className="flex flex-wrap items-center gap-3">
        <Link className="button-primary" href={option.route}>
          Начать подбор ухода
        </Link>
        <span className="premium-fineprint">Разовый доступ от {option.priceRub} RUB</span>
      </div>
    </section>
  );
}
