import Link from "next/link";
import { SCENARIOS } from "@/lib/scenarios";
import { ModulePageTracker } from "@/components/ModulePageTracker";

const option = SCENARIOS["beauty-routine"];

export default function BeautyPage() {
  return (
    <section className="premium-page space-y-6">
      <ModulePageTracker module="beauty" page="module" />

      <header className="premium-page-header">
        <p className="premium-kicker">Уход</p>
        <h1 className="premium-title">Подбор ухода</h1>
        <p className="premium-subtitle">
          Помогаем сделать рутину понятной и спокойной: сначала короткий предварительный вывод, затем полный разбор при
          необходимости.
        </p>
      </header>

      <article className="premium-section p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-[#1f2937]">{option.shortTitle}</h2>
        <p className="mt-2 text-sm text-[#5e6a7d]">{option.subtitle}</p>

        <div className="premium-grid-cards premium-grid-cards-2 mt-5">
          <div className="premium-note p-4 text-sm">
            <p className="font-medium text-[#2b3748]">Предварительный вывод</p>
            <p className="mt-2">{option.weakOutcome}</p>
          </div>
          <div className="premium-note p-4 text-sm">
            <p className="font-medium text-[#2b3748]">Полный разбор</p>
            <p className="mt-2">{option.fullOutcome}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link className="button-primary" href={option.route}>
            Начать
          </Link>
          <span className="premium-fineprint">Разовый доступ от {option.priceRub} RUB</span>
        </div>
      </article>
    </section>
  );
}
