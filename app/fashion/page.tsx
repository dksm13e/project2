import Link from "next/link";
import { SCENARIOS } from "@/lib/scenarios";
import { ModulePageTracker } from "@/components/ModulePageTracker";

const options = [SCENARIOS["fashion-size"], SCENARIOS["fashion-fit-check"]];

export default function FashionPage() {
  return (
    <section className="space-y-6">
      <ModulePageTracker module="fashion" page="module" />
      <header className="space-y-3">
        <p className="pill inline-flex">Одежда</p>
        <h1 className="display-title">Подбор одежды</h1>
        <p className="max-w-3xl text-[#5f5243]">Выберите задачу: подобрать размер или проверить сочетание в образе.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {options.map((item) => (
          <article key={item.id} className="product-card p-6">
            <h2 className="text-xl font-semibold text-[#2f251b]">{item.shortTitle}</h2>
            <p className="mt-2 text-sm text-[#5e5142]">{item.subtitle}</p>
            <p className="mt-4 text-sm text-[#493d2f]">Сразу: {item.weakOutcome}</p>
            <p className="mt-1 text-sm text-[#493d2f]">После оплаты: {item.fullOutcome}</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm font-medium text-[#665949]">от {item.priceRub} RUB</span>
              <Link className="button-secondary" href={item.route}>
                Начать
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
