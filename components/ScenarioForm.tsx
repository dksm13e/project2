"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getPreviewUsage, canUsePreview, getGuestId, registerPreviewUse } from "@/lib/guest";
import { saveDraft } from "@/lib/flow";
import { ScenarioField, ScenarioId, getScenario } from "@/lib/scenarios";
import { ANALYTICS_EVENT_NAMES, trackEvent } from "@/lib/analytics";
import { getAiSmartFieldHint } from "@/lib/ai/router";

const PREVIEW_LIMIT = 3;

type Props = {
  scenarioId: ScenarioId;
};

function FieldControl({ field }: { field: ScenarioField }) {
  const commonClass = "input-base";

  if (field.type === "textarea") {
    return (
      <textarea
        name={field.name}
        required={field.required}
        placeholder={field.placeholder}
        className={`${commonClass} min-h-28 resize-y py-3`}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select name={field.name} required={field.required} defaultValue="" className={commonClass}>
        <option value="" disabled>
          Выберите вариант
        </option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
      name={field.name}
      required={field.required}
      placeholder={field.placeholder}
      className={commonClass}
    />
  );
}

const tourSteps = [
  {
    title: "Шаг 1 из 3",
    text: "Заполните короткую форму. Обычно это занимает меньше минуты."
  },
  {
    title: "Шаг 2 из 3",
    text: "Справа видно, что вы получите сразу и что откроется после оплаты."
  },
  {
    title: "Шаг 3 из 3",
    text: "Нажмите кнопку и получите предварительный вывод по вашему запросу."
  }
] as const;

export function ScenarioForm({ scenarioId }: Props) {
  const router = useRouter();
  const scenario = useMemo(() => getScenario(scenarioId), [scenarioId]);

  const [usageCount, setUsageCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [formStartedTracked, setFormStartedTracked] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);

  useEffect(() => {
    getGuestId();
    const usage = getPreviewUsage(PREVIEW_LIMIT);
    setUsageCount(usage.count);
    setLimitReached(usage.count >= PREVIEW_LIMIT);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("tour") === "1") {
      setTourStep(0);
    }
  }, []);

  if (!scenario) {
    return (
      <section className="surface p-8">
        <h1 className="text-2xl font-semibold">Раздел не найден</h1>
        <Link href="/" className="button-secondary mt-4 inline-flex">
          На главную
        </Link>
      </section>
    );
  }

  const markFormStarted = () => {
    if (formStartedTracked) return;

    trackEvent(ANALYTICS_EVENT_NAMES.formStarted, {
      scenario_id: scenario.id,
      module: scenario.categoryRoute.replace("/", "")
    });

    setFormStartedTracked(true);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    markFormStarted();

    if (!canUsePreview(PREVIEW_LIMIT)) {
      setLimitReached(true);
      setUsageCount(PREVIEW_LIMIT);
      return;
    }

    const form = new FormData(event.currentTarget);
    const inputs: Record<string, string> = {};

    for (const field of scenario.fields) {
      const raw = form.get(field.name);
      inputs[field.name] = typeof raw === "string" ? raw.trim() : "";
    }

    const filledFields = Object.values(inputs).filter((value) => value.length > 0).length;

    trackEvent(ANALYTICS_EVENT_NAMES.formCompleted, {
      scenario_id: scenario.id,
      fields_total: scenario.fields.length,
      fields_filled: filledFields
    });

    registerPreviewUse();
    const draft = saveDraft(scenario.id, inputs);
    router.push(`/preview/${scenario.id}?draft=${draft.id}`);
  };

  const remaining = Math.max(PREVIEW_LIMIT - usageCount, 0);

  const nextTourStep = () => {
    if (tourStep === null) return;
    if (tourStep >= tourSteps.length - 1) {
      setTourStep(null);
      return;
    }
    setTourStep((current) => (current === null ? null : current + 1));
  };

  return (
    <section className="space-y-7">
      {tourStep !== null ? (
        <div className="surface relative overflow-hidden border-[#d4c4ae] bg-[#fffaf3] p-4 sm:p-5">
          <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-[#edd7be] blur-2xl" aria-hidden="true" />
          <p className="text-xs uppercase tracking-[0.16em] text-[#7a6956]">{tourSteps[tourStep].title}</p>
          <p className="mt-2 max-w-3xl text-sm text-[#4f4335]">{tourSteps[tourStep].text}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={nextTourStep} className="button-primary">
              {tourStep >= tourSteps.length - 1 ? "Понятно" : "Далее"}
            </button>
            <button onClick={() => setTourStep(null)} className="button-ghost text-xs">
              Пропустить подсказку
            </button>
          </div>
        </div>
      ) : null}

      <header className="space-y-3">
        <p className="pill inline-flex">{scenario.tagline}</p>
        <h1 className="display-title text-balance">{scenario.shortTitle}</h1>
        <p className="max-w-3xl text-base text-[#5f554a]">{scenario.subtitle}</p>
        <p className="max-w-3xl text-sm text-[#706453]">
          Расскажите немного о задаче и получите предварительный вывод. Полный разбор откроется после оплаты.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <form
          onSubmit={onSubmit}
          onFocusCapture={markFormStarted}
          className={`surface p-6 transition sm:p-8 ${tourStep === 0 ? "ring-2 ring-[#ad7248] ring-offset-2 ring-offset-[#f4efe7]" : ""}`}
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-[#2d241a]">Короткая форма</h2>
            <span className="text-xs uppercase tracking-[0.18em] text-[#7a6a59]">Шаг 1/3</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {scenario.fields.map((field) => {
              const smartHint = getAiSmartFieldHint(scenario.id, field.name);

              return (
                <label key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                  <span className="mb-1.5 block text-sm font-medium text-[#3e3326]">{field.label}</span>
                  <FieldControl field={field} />
                  {field.hint ? <span className="mt-1 block text-xs text-[#796c5c]">{field.hint}</span> : null}
                  {smartHint ? <span className="mt-1 block text-xs text-[#8a4b2b]">Совет: {smartHint}</span> : null}
                </label>
              );
            })}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className={`button-primary ${tourStep === 2 ? "ring-2 ring-[#ad7248] ring-offset-2 ring-offset-[#fffdf9]" : ""}`}
            >
              Показать предварительный вывод
            </button>
            <span className="text-xs text-[#6d6051]">Лимит: {usageCount}/{PREVIEW_LIMIT}, осталось: {remaining}</span>
          </div>

          <div className="mt-6 rounded-2xl border border-[#ddcfbe] bg-[#fbf6ee] p-4 text-sm text-[#5b4f40]">
            <p className="font-medium text-[#3e3225]">Приватность:</p>
            <ul className="mt-2 space-y-1">
              <li>- Без регистрации</li>
              <li>- Без email и телефона</li>
              <li>- Доступ к результату по коду</li>
            </ul>
          </div>
        </form>

        <aside className={`space-y-4 ${tourStep === 1 ? "ring-2 ring-[#ad7248] ring-offset-2 ring-offset-[#f4efe7] rounded-3xl" : ""}`}>
          <div className="surface-muted p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6f6252]">
              Что получите сразу
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[#55493b]">
              {scenario.weakPreviewItems.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>

          <div className="surface-muted p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6f6252]">
              Что входит в полный разбор
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[#55493b]">
              {scenario.fullResultItems.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm font-medium text-[#3a2f22]">Цена: {scenario.priceRub} RUB</p>
          </div>
        </aside>
      </div>

      {limitReached ? (
        <div className="rounded-2xl border border-[#dbc8aa] bg-[#fdf5e4] px-5 py-4 text-sm text-[#6f4a1d]">
          Дневной лимит предварительных выводов достигнут. Можно вернуться завтра или открыть полный разбор из уже созданного результата.
        </div>
      ) : null}
    </section>
  );
}
