"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type EntryId =
  | "simplify"
  | "remove-extra"
  | "base-scheme"
  | "reduce-reaction"
  | "introduce-steps"
  | "recover-base";

const ENTRY_SCENARIOS: Array<{
  id: EntryId;
  label: string;
  hint: string;
}> = [
  {
    id: "simplify",
    label: "Хочу упростить уход",
    hint: "Соберём короткую и понятную схему без лишних шагов. Покажем, что оставить, а что пока не добавлять."
  },
  {
    id: "remove-extra",
    label: "Хочу убрать лишнее",
    hint: "Разберём текущий набор и уберём дублирующие шаги. Оставим спокойную рабочую основу."
  },
  {
    id: "base-scheme",
    label: "Хочу понять базовую схему",
    hint: "Сформируем спокойный AM/PM-каркас для повседневного ухода. Без перегруза и сложных комбинаций."
  },
  {
    id: "reduce-reaction",
    label: "Хочу снизить риск реакции",
    hint: "Сместим акцент в сторону барьера и мягкого режима. Уберём потенциально раздражающие сочетания."
  },
  {
    id: "introduce-steps",
    label: "Хочу спокойно ввести новые шаги",
    hint: "Дадим порядок и темп введения новых средств."
  },
  {
    id: "recover-base",
    label: "Хочу восстановить спокойную базу",
    hint: "Соберём мягкий поддерживающий минимум. Поможем вернуться к стабильной схеме, если уход перегружен."
  }
];

export function BeautyEntryScenarios() {
  const [activeScenario, setActiveScenario] = useState<EntryId>("simplify");
  const active = useMemo(
    () => ENTRY_SCENARIOS.find((scenario) => scenario.id === activeScenario) ?? ENTRY_SCENARIOS[0],
    [activeScenario]
  );

  return (
    <section className="premium-section p-6 sm:p-8">
      <p className="premium-kicker">Сценарии входа</p>
      <h2 className="mt-2 text-2xl font-semibold text-[#1f2a39]">С чем вы пришли сегодня</h2>
      <p className="mt-2 text-sm text-[#5d6a7f]">
        Выберите близкий сценарий, чтобы начать с более понятного направления.
      </p>

      <div className="entry-chip-row mt-4">
        {ENTRY_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => setActiveScenario(scenario.id)}
            className={`entry-chip ${activeScenario === scenario.id ? "entry-chip-active" : ""}`}
          >
            {scenario.label}
          </button>
        ))}
      </div>

      <div className="premium-note mt-4 p-4 text-sm text-[#5d6a80]">{active.hint}</div>

      <Link href={`/beauty/routine?entry=${active.id}`} className="button-secondary mt-4 inline-flex">
        Перейти к форме с этим сценарием
      </Link>
    </section>
  );
}
