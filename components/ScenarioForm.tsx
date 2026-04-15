"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getPreviewUsage, canUsePreview, getGuestId, registerPreviewUse } from "@/lib/guest";
import { saveDraft } from "@/lib/flow";
import { saveDraftImageInputs } from "@/lib/flow-images";
import { ScenarioField, ScenarioId, getScenario } from "@/lib/scenarios";
import { ANALYTICS_EVENT_NAMES, trackEvent } from "@/lib/analytics";
import { fetchFormHints } from "@/lib/ai/http";

const PREVIEW_LIMIT = 3;
const MAX_IMAGE_DATA_URL_LENGTH = 650_000;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("FileReader did not return a string result."));
      }
    };
    reader.onerror = () => reject(new Error("FileReader failed to read image."));
    reader.readAsDataURL(file);
  });
}

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
        <option value="" disabled={field.required}>
          {field.required ? "Выберите вариант" : "Не выбрано"}
        </option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "multiselect") {
    return (
      <div className="grid gap-2 rounded-xl border border-[#d1dbe8] bg-[rgba(255,255,255,0.9)] p-3">
        {field.options?.map((option) => (
          <label key={option.value} className="inline-flex items-center gap-2 text-sm text-[#364152]">
            <input type="checkbox" name={field.name} value={option.value} className="h-4 w-4 rounded border-[#b9c7db]" />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "file") {
    return (
      <input
        type="file"
        name={field.name}
        accept={field.accept ?? "image/*"}
        required={field.required}
        className="block w-full rounded-xl border border-[#d1dbe8] bg-[rgba(255,255,255,0.9)] px-3 py-2.5 text-sm text-[#354153] file:mr-3 file:rounded-lg file:border-0 file:bg-[#eaf1fb] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#2f3b4c]"
      />
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

const beautyEntryHints = {
  simplify: {
    title: "Сценарий: упростить уход",
    text: "Сфокусируйтесь на базовых шагах и отметьте, какие средства хотите сократить."
  },
  "remove-extra": {
    title: "Сценарий: убрать лишнее",
    text: "В поле текущего ухода перечислите всё, что используете сейчас, чтобы убрать перегруз."
  },
  "base-scheme": {
    title: "Сценарий: базовая схема",
    text: "Укажите тип кожи и чувствительность — этого достаточно, чтобы собрать спокойный каркас AM/PM."
  },
  "reduce-reaction": {
    title: "Сценарий: снизить риск реакции",
    text: "Отметьте чувствительность и что уже не подошло — это снизит агрессивность рекомендаций."
  },
  "introduce-steps": {
    title: "Сценарий: спокойно ввести новые шаги",
    text: "Укажите отношение к активам и текущий уход, чтобы получить безопасный порядок введения."
  }
} as const;

type BeautyEntryKey = keyof typeof beautyEntryHints;

export function ScenarioForm({ scenarioId }: Props) {
  const router = useRouter();
  const scenario = useMemo(() => getScenario(scenarioId), [scenarioId]);

  const [usageCount, setUsageCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [formStartedTracked, setFormStartedTracked] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [smartHints, setSmartHints] = useState<Record<string, string>>({});
  const [entryHint, setEntryHint] = useState<{ title: string; text: string } | null>(null);

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

    if (scenario?.id === "beauty-routine") {
      const entry = query.get("entry");
      if (entry && entry in beautyEntryHints) {
        setEntryHint(beautyEntryHints[entry as BeautyEntryKey]);
      } else {
        setEntryHint(null);
      }
      return;
    }

    setEntryHint(null);
  }, [scenario]);

  useEffect(() => {
    if (!scenario) {
      setSmartHints({});
      return;
    }

    let isMounted = true;

    fetchFormHints(scenario.id)
      .then((hints) => {
        if (!isMounted) return;
        setSmartHints(hints);
      })
      .catch(() => {
        if (!isMounted) return;
        setSmartHints({});
      });

    return () => {
      isMounted = false;
    };
  }, [scenario]);

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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    markFormStarted();

    if (!canUsePreview(PREVIEW_LIMIT)) {
      setLimitReached(true);
      setUsageCount(PREVIEW_LIMIT);
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const inputs: Record<string, string> = {};
    const imageInputs: Record<string, string> = {};

    for (const field of scenario.fields) {
      if (field.type === "multiselect") {
        const selected = form
          .getAll(field.name)
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.trim())
          .filter(Boolean);
        inputs[field.name] = selected.join(", ");
        continue;
      }

      if (field.type === "file") {
        const raw = form.get(field.name);
        if (raw instanceof File && raw.size > 0) {
          const cleanName = raw.name.replace(/\s+/g, "_");
          const kb = Math.max(1, Math.round(raw.size / 1024));
          inputs[field.name] = `upload:${cleanName}|${raw.type || "image/unknown"}|${kb}kb`;

          if ((raw.type || "").startsWith("image/")) {
            try {
              const dataUrl = await fileToDataUrl(raw);
              if (dataUrl.startsWith("data:image/") && dataUrl.length <= MAX_IMAGE_DATA_URL_LENGTH) {
                imageInputs[field.name] = dataUrl;
              }
            } catch {
              // Ignore image parsing errors and keep metadata-only fallback.
            }
          }
        } else {
          inputs[field.name] = "";
        }
        continue;
      }

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
    saveDraftImageInputs(draft.id, imageInputs);
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
    <section className="premium-page space-y-7">
      {tourStep !== null ? (
        <div className="surface relative overflow-hidden border-[#cfd9e9] bg-[rgba(248,252,255,0.9)] p-4 sm:p-5">
          <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-[#e8f0fa] blur-2xl" aria-hidden="true" />
          <p className="text-xs uppercase tracking-[0.16em] text-[#6f7b8d]">{tourSteps[tourStep].title}</p>
          <p className="mt-2 max-w-3xl text-sm text-[#4f5c70]">{tourSteps[tourStep].text}</p>
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

      {entryHint ? (
        <div className="surface border-[#cfd9e9] bg-[rgba(248,252,255,0.9)] p-4 text-sm text-[#586579]">
          <p className="text-xs uppercase tracking-[0.16em] text-[#6f7b8d]">{entryHint.title}</p>
          <p className="mt-2">{entryHint.text}</p>
        </div>
      ) : null}

      <header className="premium-page-header">
        <p className="premium-kicker">{scenario.tagline}</p>
        <h1 className="premium-title text-balance">{scenario.shortTitle}</h1>
        <p className="premium-subtitle">{scenario.subtitle}</p>
        <p className="max-w-3xl text-sm text-[#667486]">
          Расскажите немного о задаче и получите предварительный вывод. Полный разбор откроется после оплаты.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <form
          onSubmit={onSubmit}
          onFocusCapture={markFormStarted}
          className={`surface p-6 transition sm:p-8 ${tourStep === 0 ? "ring-2 ring-[#90a9ca] ring-offset-2 ring-offset-[#f3f7fd]" : ""}`}
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-[#243142]">Короткая форма</h2>
            <span className="text-xs uppercase tracking-[0.18em] text-[#708095]">Шаг 1/3</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {scenario.fields.map((field) => {
              const smartHint = smartHints[field.name] ?? null;

              return (
                <label
                  key={field.name}
                  className={field.type === "textarea" || field.type === "multiselect" || field.type === "file" ? "sm:col-span-2" : ""}
                >
                  <span className="mb-1.5 block text-sm font-medium text-[#303c4e]">{field.label}</span>
                  <FieldControl field={field} />
                  {field.hint ? <span className="mt-1 block text-xs text-[#6f7d90]">{field.hint}</span> : null}
                  {smartHint ? <span className="mt-1 block text-xs text-[#516179]">Совет: {smartHint}</span> : null}
                </label>
              );
            })}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className={`button-primary ${tourStep === 2 ? "ring-2 ring-[#90a9ca] ring-offset-2 ring-offset-[#fffdf9]" : ""}`}
            >
              Показать предварительный вывод
            </button>
            <span className="text-xs text-[#667485]">Лимит: {usageCount}/{PREVIEW_LIMIT}, осталось: {remaining}</span>
          </div>

          <div className="premium-note mt-6 p-4 text-sm">
            <p className="font-medium text-[#2a3647]">Приватность:</p>
            <ul className="mt-2 space-y-1">
              <li>- Без регистрации</li>
              <li>- Без email и телефона</li>
              <li>- Доступ к результату по коду</li>
            </ul>
          </div>
        </form>

        <aside className={`space-y-4 ${tourStep === 1 ? "ring-2 ring-[#90a9ca] ring-offset-2 ring-offset-[#f4efe7] rounded-3xl" : ""}`}>
          <div className="surface-muted p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#738298]">
              Что получите сразу
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[#556274]">
              {scenario.weakPreviewItems.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>

          <div className="surface-muted p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#738298]">
              Что входит в полный разбор
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[#556274]">
              {scenario.fullResultItems.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm font-medium text-[#2f3a4a]">Цена: {scenario.priceRub} RUB</p>
          </div>
        </aside>
      </div>

      {limitReached ? (
        <div className="rounded-2xl border border-[#d0dbe9] bg-[#f4f8ff] px-5 py-4 text-sm text-[#526076]">
          Дневной лимит предварительных выводов достигнут. Можно вернуться завтра или открыть полный разбор из уже созданного результата.
        </div>
      ) : null}
    </section>
  );
}
