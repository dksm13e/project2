import Link from "next/link";
import { SCENARIOS } from "@/lib/scenarios";
import { ModulePageTracker } from "@/components/ModulePageTracker";
import { BeautyEntryScenarios } from "@/components/BeautyEntryScenarios";

const option = SCENARIOS["beauty-routine"];

export default function BeautyPage() {
  return (
    <section className="premium-page space-y-6">
      <ModulePageTracker module="beauty" page="module" />

      <header className="premium-page-header">
        <p className="premium-kicker">Уход</p>
        <h1 className="premium-title">Понятный уход без перегруза</h1>
        <p className="premium-subtitle">
          Помогаем собрать спокойную рутину под вашу кожу: что оставить, что убрать и какие шаги не стоит смешивать.
        </p>
      </header>

      <BeautyEntryScenarios />

      <article className="premium-section p-6 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <div className="premium-note p-5">
            <p className="premium-stat">Сначала вы получите</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1f2a39]">Первый ориентир по уходу до оплаты</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#5d6a80]">
              <li>- Короткий вывод по главному фокусу ухода.</li>
              <li>- Один ключевой риск перегруза или несовместимости.</li>
              <li>- Понятный следующий шаг без лишней агрессии.</li>
            </ul>
          </div>

          <div className="premium-note p-5">
            <p className="premium-stat">После оплаты</p>
            <p className="mt-2 text-sm text-[#5d6a80]">
              Спокойный структурный разбор: AM/PM, что оставить, что убрать, что не смешивать и как безопасно вводить
              новые шаги.
            </p>
            <p className="mt-3 text-xs text-[#6b7790]">Разовый продукт без подписки</p>
          </div>
        </div>
      </article>

      <div className="premium-grid-cards premium-grid-cards-2">
        <article className="premium-card p-5 sm:p-6">
          <p className="premium-stat">Предварительный вывод</p>
          <h3 className="mt-3 text-[1.32rem] font-semibold leading-tight text-[#1f2939]">Что увидите сразу</h3>
          <p className="mt-2 text-sm text-[#5e6a7d]">{option.weakOutcome}</p>
          <ul className="mt-4 space-y-2 text-sm text-[#5e6a7d]">
            <li>- Базовый тип рутины под ваш ввод.</li>
            <li>- Главный фокус: барьер, акне, обезвоженность и т.д.</li>
            <li>- Один безопасный следующий шаг.</li>
          </ul>
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
          <ul className="mt-4 space-y-2 text-sm text-[#5e6a7d]">
            <li>- Что оставить в текущем уходе.</li>
            <li>- Что лучше убрать или сократить.</li>
            <li>- Какие сочетания не использовать вместе.</li>
          </ul>

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

      <div className="flex flex-wrap items-center gap-3">
        <Link className="button-primary" href={option.route}>
          Начать подбор ухода
        </Link>
        <span className="premium-fineprint">Разовый доступ от {option.priceRub} RUB</span>
      </div>
    </section>
  );
}
