import Link from "next/link";
import { SCENARIOS } from "@/lib/scenarios";
import { ModulePageTracker } from "@/components/ModulePageTracker";

const options = [SCENARIOS["fashion-size"], SCENARIOS["fashion-fit-check"]];

export default function FashionPage() {
  return (
    <section className="premium-page space-y-6">
      <ModulePageTracker module="fashion" page="module" />

      <header className="premium-page-header">
        <p className="premium-kicker">Одежда</p>
        <h1 className="premium-title">Подбор одежды перед покупкой</h1>
        <p className="premium-subtitle">
          Выберите формат: точный подбор размера или проверка образа. Сначала вы увидите предварительный вывод, а
          затем решите, нужен ли полный разбор.
        </p>
      </header>

      <div className="premium-section p-6 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <div className="premium-note p-5">
            <p className="premium-stat">Сильная сторона</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1f2a39]">Спокойный первый ориентир до оплаты</h2>
            <p className="mt-2 text-sm text-[#5c6980]">
              Перед оплатой вы получите спокойный первый вывод по размеру и посадке. Полный разбор открывается только
              когда нужны детали.
            </p>
          </div>

          <div className="premium-note p-5">
            <p className="premium-stat">Форматы</p>
            <div className="segment-group mt-3">
              {options.map((item) => (
                <Link key={`seg-${item.id}`} href={item.route} className="segment-item">
                  {item.shortTitle}
                </Link>
              ))}
            </div>
            <p className="mt-3 text-xs text-[#6a778c]">Разовые продукты без подписки</p>
          </div>
        </div>
      </div>

      <div className="premium-grid-cards premium-grid-cards-2">
        {options.map((item) => (
          <article key={item.id} className="premium-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <p className="premium-stat">{item.tagline}</p>
              <span className="rounded-full border border-[#c6d3e5] bg-white px-3 py-1 text-xs font-medium text-[#415069]">
                от {item.priceRub} RUB
              </span>
            </div>
            <h3 className="mt-3 text-[1.38rem] font-semibold leading-tight text-[#1f2939]">{item.shortTitle}</h3>
            <p className="mt-2 text-sm text-[#5e6a7d]">{item.subtitle}</p>

            <div className="premium-note mt-4 p-4 text-sm">
              <p className="font-medium text-[#2b3748]">Сначала вы увидите:</p>
              <p className="mt-1">{item.weakOutcome}</p>
            </div>

            <div className="premium-note mt-3 p-4 text-sm">
              <p className="font-medium text-[#2b3748]">В полном разборе:</p>
              <p className="mt-1">{item.fullOutcome}</p>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-xs uppercase tracking-[0.14em] text-[#6f7b8f]">Разовый доступ</span>
              <Link className="button-primary" href={item.route}>
                Начать
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
