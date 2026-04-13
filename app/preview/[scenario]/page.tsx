"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ANALYTICS_EVENT_NAMES, trackEvent } from "@/lib/analytics";
import { TrackedLink } from "@/components/TrackedLink";
import { getWeakPreviewForDraft } from "@/lib/flow";
import { getScenario } from "@/lib/scenarios";
import { runAiRoute } from "@/lib/ai/router";
import type { PaywallSummaryOutput, PreviewModeOutput } from "@/lib/ai/outputSchemas";

const lockedItems = [
  "Подробная логика выбора",
  "Персональные рекомендации",
  "Альтернативные варианты",
  "Блок «что важно учесть»",
  "PDF-отчет",
  "Код доступа"
];

export default function PreviewPage() {
  const params = useParams<{ scenario: string }>();

  const scenario = getScenario(params.scenario);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<ReturnType<typeof getWeakPreviewForDraft>>(null);
  const [shownTracked, setShownTracked] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setDraftId(query.get("draft"));
  }, []);

  useEffect(() => {
    setPreviewState(getWeakPreviewForDraft(draftId));
  }, [draftId]);

  useEffect(() => {
    if (!scenario || !previewState || shownTracked) return;
    if (previewState.draft.scenarioId !== scenario.id) return;

    trackEvent(ANALYTICS_EVENT_NAMES.weakPreviewShown, {
      scenario_id: scenario.id,
      draft_id: previewState.draft.id
    });
    setShownTracked(true);
  }, [scenario, previewState, shownTracked]);

  const aiPreview = useMemo(() => {
    if (!scenario || !previewState) return null;
    const routed = runAiRoute({
      scenarioId: scenario.id,
      mode: "preview",
      inputs: previewState.draft.inputs
    });
    return routed.output as PreviewModeOutput;
  }, [scenario, previewState]);

  const aiPaywall = useMemo(() => {
    if (!scenario || !previewState) return null;
    const routed = runAiRoute({
      scenarioId: scenario.id,
      mode: "paywall_summary",
      inputs: previewState.draft.inputs
    });
    return routed.output as PaywallSummaryOutput;
  }, [scenario, previewState]);

  if (!scenario) {
    return (
      <section className="surface p-8">
        <h1 className="text-2xl font-semibold">Раздел не найден</h1>
        <Link href="/" className="button-secondary mt-5 inline-flex">
          На главную
        </Link>
      </section>
    );
  }

  if (!previewState || previewState.draft.scenarioId !== scenario.id || !aiPreview || !aiPaywall) {
    return (
      <section className="surface p-8">
        <h1 className="text-2xl font-semibold">Предварительный результат недоступен</h1>
        <p className="mt-3 text-sm text-[#6e6150]">Не удалось загрузить данные формы. Попробуйте отправить форму еще раз.</p>
        <Link href={scenario.route} className="button-primary mt-5 inline-flex">
          Вернуться к форме
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-7">
      <header className="space-y-3">
        <p className="pill inline-flex">Шаг 2/3 · предварительный вывод</p>
        <h1 className="display-title">Предварительный вывод готов</h1>
        <p className="max-w-3xl text-[#615444]">{aiPreview.preview_summary}</p>
        <p className="text-sm text-[#6d6051]">
          Confidence:{" "}
          <span className="font-medium text-[#3c3125]">
            {aiPreview.confidence === "high" ? "высокий" : aiPreview.confidence === "medium" ? "средний" : "ограниченный"}
          </span>
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="surface p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[#766857]">Предварительный вывод</p>
          <p className="mt-2 text-xl font-semibold text-[#2c2318]">~20% информации</p>
          <p className="mt-1 text-sm text-[#685b4a]">Один ключевой вывод, один риск и один следующий шаг.</p>
        </div>
        <div className="surface p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[#766857]">Полный разбор</p>
          <p className="mt-2 text-xl font-semibold text-[#2c2318]">100% ценности</p>
          <p className="mt-1 text-sm text-[#685b4a]">Подробная структура, рекомендации, PDF и код доступа.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="surface p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#2e2419]">Что уже понятно</h2>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-[#dacbb9] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#776958]">Ключевой вывод</p>
              <p className="mt-2 text-sm text-[#3f3427]">{aiPreview.key_insight}</p>
            </div>
            <div className="rounded-2xl border border-[#dacbb9] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#776958]">Основной риск</p>
              <p className="mt-2 text-sm text-[#3f3427]">{aiPreview.main_risk}</p>
            </div>
            <div className="rounded-2xl border border-[#dacbb9] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#776958]">Следующий шаг</p>
              <p className="mt-2 text-sm text-[#3f3427]">{aiPreview.next_step}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#dbcbb8] bg-[#fbf4ea] p-4 text-sm text-[#5e513f]">
            Это намеренно короткий вывод: достаточно, чтобы проверить направление, но без раскрытия полного разбора.
          </div>
        </article>

        <aside className="space-y-4">
          <div className="surface-muted relative overflow-hidden p-6">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#f3eee5] to-transparent" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6f6150]">Разделы, которые пока скрыты</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#5f5242]">
              {lockedItems.map((item) => (
                <li key={item} className="select-none rounded-xl border border-dashed border-[#cbb89e] bg-[#fff8ef]/70 px-3 py-2 blur-[1.8px]">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-muted p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6f6150]">Что откроется после оплаты</h2>
            <p className="mt-2 text-sm text-[#5d5040]">{aiPaywall.short_summary}</p>
            <p className="mt-2 text-sm text-[#6c5f50]">{aiPaywall.confidence_note}</p>
            <ul className="mt-3 space-y-2 text-sm text-[#594c3d]">
              {aiPaywall.value_bullets.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-[#564838]">
              Цена: <span className="text-xl font-semibold text-[#2b2117]">{scenario.priceRub} RUB</span>
            </p>
            <TrackedLink
              href={`/checkout?scenario=${scenario.id}&draft=${previewState.draft.id}`}
              eventName={ANALYTICS_EVENT_NAMES.clickUnlockFullResult}
              eventPayload={{ scenario_id: scenario.id, draft_id: previewState.draft.id }}
              className="button-primary mt-5 inline-flex w-full justify-center"
            >
              Открыть полный разбор
            </TrackedLink>
          </div>

          <div className="rounded-2xl border border-[#dccfbe] bg-white p-4 text-sm text-[#5d5141]">
            <p className="font-medium text-[#3d3124]">Почему это удобно:</p>
            <ul className="mt-2 space-y-1">
              <li>- Без регистрации</li>
              <li>- Полный разбор сразу после оплаты</li>
              <li>- Повторный доступ по коду</li>
            </ul>
            {aiPreview.interpretation_limitations.length ? (
              <>
                <p className="mt-3 font-medium text-[#3d3124]">Что ограничивает точность сейчас:</p>
                <ul className="mt-1 space-y-1">
                  {aiPreview.interpretation_limitations.map((line) => (
                    <li key={line}>- {line}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
