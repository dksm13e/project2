import Link from "next/link";
import { SCENARIOS } from "@/lib/scenarios";
import { ModulePageTracker } from "@/components/ModulePageTracker";

const option = SCENARIOS["home-room-set"];

export default function HomeCategoryPage() {
  return (
    <section className="space-y-6">
      <ModulePageTracker module="home" page="module" />
      <header className="space-y-3">
        <p className="pill inline-flex">Дом</p>
        <h1 className="display-title">Подбор для дома</h1>
        <p className="max-w-3xl text-[#5f5243]">Поможем собрать набор для комнаты под ваш стиль и бюджет.</p>
      </header>

      <article className="product-card p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-[#2f251b]">{option.shortTitle}</h2>
        <p className="mt-2 text-sm text-[#5d5041]">{option.subtitle}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#d8cab8] bg-white p-4 text-sm text-[#574a3b]">
            <p className="text-xs uppercase tracking-[0.14em] text-[#776958]">Предварительный вывод</p>
            <p className="mt-2">{option.weakOutcome}</p>
          </div>
          <div className="rounded-xl border border-[#d8cab8] bg-white p-4 text-sm text-[#574a3b]">
            <p className="text-xs uppercase tracking-[0.14em] text-[#776958]">Полный разбор</p>
            <p className="mt-2">{option.fullOutcome}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link className="button-primary" href={option.route}>
            Начать
          </Link>
          <span className="text-sm text-[#665949]">Разовый доступ от {option.priceRub} RUB</span>
        </div>
      </article>
    </section>
  );
}
