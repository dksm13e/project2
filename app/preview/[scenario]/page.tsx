"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ANALYTICS_EVENT_NAMES, trackEvent } from "@/lib/analytics";
import { TrackedLink } from "@/components/TrackedLink";
import { AiFeatureImage } from "@/components/AiFeatureImage";
import { getWeakPreviewForDraft } from "@/lib/flow";
import { mergeInputsWithDraftImages } from "@/lib/flow-images";
import { getScenario } from "@/lib/scenarios";
import { fetchAiRoute } from "@/lib/ai/http";
import { getCachedPreviewBundle, setCachedPreviewBundle } from "@/lib/ai/cache";
import { buildPaywallSummaryFromPreview } from "@/lib/ai/paywall";
import type { PaywallSummaryOutput, PreviewModeOutput } from "@/lib/ai/schemas";

const LOCKED_ITEMS = [
  "Подробная логика выбора",
  "Персональные рекомендации",
  "Альтернативные варианты",
  "Блок «что важно учесть»",
  "PDF-отчет",
  "Код доступа"
];

function getFeatureKind(scenarioId: string): string {
  if (scenarioId.includes("fashion")) return "fashion-preview";
  if (scenarioId.includes("home")) return "home-preview";
  return "beauty-preview";
}

function FashionSizeTeaser() {
  return (
    <div className="preview-teaser-inner preview-teaser-fashion">
      <div className="preview-teaser-head">
        <p className="preview-teaser-label">Как выглядит полный результат</p>
        <h2 className="preview-teaser-title">Полный разбор по вещи</h2>
      </div>

      <div className="preview-teaser-top-grid">
        <div className="preview-teaser-top-item">
          <p>Основной размер</p>
          <strong>M</strong>
        </div>
        <div className="preview-teaser-top-item">
          <p>Альтернативный размер</p>
          <strong>L для более свободной посадки</strong>
        </div>
        <div className="preview-teaser-top-item">
          <p>Ключевой риск</p>
          <strong>Плечи и длина рукава</strong>
        </div>
        <div className="preview-teaser-top-item">
          <p>Следующий шаг</p>
          <strong>Проверить мерки изделия перед заказом</strong>
        </div>
      </div>

      <div className="preview-teaser-mini-grid">
        <article className="preview-teaser-mini-card">
          <p className="preview-teaser-mini-label">Размер</p>
          <p className="preview-teaser-mini-text">
            M. Альтернатива: L для более свободной посадки и лучшего запаса по верхней части.
          </p>
        </article>
        <article className="preview-teaser-mini-card">
          <p className="preview-teaser-mini-label">Посадка</p>
          <p className="preview-teaser-mini-text">Сядет ближе к телу в плечах, по корпусу останется комфортной.</p>
        </article>
        <article className="preview-teaser-mini-card">
          <p className="preview-teaser-mini-label">Что проверить</p>
          <p className="preview-teaser-mini-text">Плечи, длину рукава и ключевые мерки изделия в карточке товара.</p>
        </article>
        <article className="preview-teaser-mini-card">
          <p className="preview-teaser-mini-label">Материал и поведение ткани</p>
          <p className="preview-teaser-mini-text">Малорастяжимая ткань: небольшой запас по свободе снижает риск промаха.</p>
        </article>
      </div>

      <p className="preview-teaser-footnote">
        После оплаты откроется полный сценарий посадки, риски по зонам, что проверить в карточке товара и PDF-версия результата.
      </p>
    </div>
  );
}

function FashionFitCheckTeaser() {
  return (
    <div className="preview-teaser-inner preview-teaser-fashion">
      <div className="preview-teaser-head">
        <p className="preview-teaser-label">Как выглядит полный результат</p>
        <h2 className="preview-teaser-title">Полный разбор сочетания до покупки</h2>
      </div>

      <div className="preview-teaser-top-grid">
        <div className="preview-teaser-top-item">
          <p>Сигнал совместимости</p>
          <strong>Умеренно высокий</strong>
        </div>
        <div className="preview-teaser-top-item">
          <p>Главный риск</p>
          <strong>Перегруз верха в многослойном образе</strong>
        </div>
        <div className="preview-teaser-top-item">
          <p>Что может выбиваться</p>
          <strong>Контраст объёмов верха и низа</strong>
        </div>
        <div className="preview-teaser-top-item">
          <p>Следующий шаг</p>
          <strong>Проверить 2-3 сочетания до оплаты заказа</strong>
        </div>
      </div>

      <div className="preview-teaser-mini-grid">
        <article className="preview-teaser-mini-card">
          <p className="preview-teaser-mini-label">С чем работает лучше</p>
          <p className="preview-teaser-mini-text">Базовый низ, чистые линии и спокойная обувь.</p>
        </article>
        <article className="preview-teaser-mini-card">
          <p className="preview-teaser-mini-label">С чем может спорить</p>
          <p className="preview-teaser-mini-text">Слишком активные фактуры и конкурирующие акценты верха.</p>
        </article>
        <article className="preview-teaser-mini-card">
          <p className="preview-teaser-mini-label">Как смягчить mismatch</p>
          <p className="preview-teaser-mini-text">Снизить контраст объёмов и добавить нейтральный промежуточный слой.</p>
        </article>
        <article className="preview-teaser-mini-card">
          <p className="preview-teaser-mini-label">Решение перед покупкой</p>
          <p className="preview-teaser-mini-text">Оценить, насколько вещь работает в ваших реальных сочетаниях, а не отдельно.</p>
        </article>
      </div>

      <p className="preview-teaser-footnote">
        После оплаты откроется подробный decision-map: сильные и слабые сочетания, триггеры несовпадения и итог по покупке.
      </p>
    </div>
  );
}

function HomeTeaser() {
  return (
    <div className="preview-teaser-inner preview-teaser-home">
      <div className="preview-teaser-head">
        <p className="preview-teaser-label">Как выглядит полный результат</p>
        <h2 className="preview-teaser-title">Полный разбор комнаты</h2>
      </div>

      <div className="preview-teaser-home-layout">
        <div className="preview-teaser-home-visual">
          <AiFeatureImage
            featureKind="home-preview"
            alt="Визуальный пример полного разбора комнаты"
            className="preview-teaser-home-image"
          />
          <p className="preview-teaser-home-caption">Пример визуального направления в полном результате</p>
        </div>

        <div className="preview-teaser-home-points">
          <article className="preview-teaser-mini-card">
            <p className="preview-teaser-mini-label">Базовый вектор</p>
            <p className="preview-teaser-mini-text">Светлая спокойная база с акцентом на хранение и визуальный порядок.</p>
          </article>
          <article className="preview-teaser-mini-card">
            <p className="preview-teaser-mini-label">Что купить сначала</p>
            <p className="preview-teaser-mini-text">Крупные базовые предметы, световые сценарии и текстильную основу.</p>
          </article>
          <article className="preview-teaser-mini-card">
            <p className="preview-teaser-mini-label">Что можно отложить</p>
            <p className="preview-teaser-mini-text">Мелкий декор, акцентные детали и вторичный свет.</p>
          </article>
          <article className="preview-teaser-mini-card">
            <p className="preview-teaser-mini-label">Что важно учесть</p>
            <p className="preview-teaser-mini-text">Масштаб комнаты, проходы и сочетаемость материалов между зонами.</p>
          </article>
        </div>
      </div>

      <p className="preview-teaser-footnote">
        В полном разборе вы увидите структуру набора, приоритеты покупок, бюджетную логику, композицию и персональный визуальный вариант.
      </p>
    </div>
  );
}

function BeautyTeaser() {
  return (
    <div className="preview-teaser-inner preview-teaser-beauty">
      <div className="preview-teaser-head">
        <p className="preview-teaser-label">Как выглядит полный результат</p>
        <h2 className="preview-teaser-title">Полный разбор ухода</h2>
      </div>

      <div className="preview-teaser-mini-grid">
        <article className="preview-teaser-mini-card">
          <p className="preview-teaser-mini-label">Утро</p>
          <p className="preview-teaser-mini-text">Очищение → базовое увлажнение → защита.</p>
        </article>
        <article className="preview-teaser-mini-card">
          <p className="preview-teaser-mini-label">Вечер</p>
          <p className="preview-teaser-mini-text">Очищение → восстановление → спокойная поддержка барьера.</p>
        </article>
        <article className="preview-teaser-mini-card">
          <p className="preview-teaser-mini-label">Что убрать</p>
          <p className="preview-teaser-mini-text">Перегружающие сочетания и лишние активные шаги в один период.</p>
        </article>
        <article className="preview-teaser-mini-card">
          <p className="preview-teaser-mini-label">Что вводить аккуратно</p>
          <p className="preview-teaser-mini-text">Новые шаги постепенно, без одновременной нагрузки на кожу.</p>
        </article>
      </div>

      <p className="preview-teaser-footnote">
        В полном результате откроется понятная схема «утро / вечер», что оставить, что убрать, что не смешивать и как вводить новые шаги спокойно.
      </p>
      <p className="preview-teaser-disclaimer">Информационный разбор ухода, не медицинское назначение.</p>
    </div>
  );
}

function FullResultTeaser({ scenarioId }: { scenarioId: string }) {
  if (scenarioId === "home-room-set") return <HomeTeaser />;
  if (scenarioId === "beauty-routine") return <BeautyTeaser />;
  if (scenarioId === "fashion-fit-check") return <FashionFitCheckTeaser />;
  return <FashionSizeTeaser />;
}

export default function PreviewPage() {
  const params = useParams<{ scenario: string }>();

  const scenario = getScenario(params.scenario);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<ReturnType<typeof getWeakPreviewForDraft>>(null);
  const [aiPreview, setAiPreview] = useState<PreviewModeOutput | null>(null);
  const [aiPaywall, setAiPaywall] = useState<PaywallSummaryOutput | null>(null);
  const [aiError, setAiError] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [shownTracked, setShownTracked] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setDraftId(query.get("draft"));
  }, []);

  useEffect(() => {
    setPreviewState(getWeakPreviewForDraft(draftId));
  }, [draftId]);

  useEffect(() => {
    if (!scenario || !previewState || previewState.draft.scenarioId !== scenario.id) {
      setAiPreview(null);
      setAiPaywall(null);
      setAiError("");
      setIsAiLoading(false);
      return;
    }

    const cached = getCachedPreviewBundle(scenario.id, previewState.draft.id);
    if (cached) {
      setAiPreview(cached.preview);
      setAiPaywall(cached.paywallSummary);
      setAiError("");
      setIsAiLoading(false);
      return;
    }

    let isMounted = true;
    setIsAiLoading(true);
    setAiError("");
    const effectiveInputs = mergeInputsWithDraftImages(previewState.draft.id, previewState.draft.inputs);

    fetchAiRoute({
      scenarioId: scenario.id,
      mode: "preview",
      inputs: effectiveInputs
    })
      .then((previewResult) => {
        if (!isMounted) return;
        const preview = previewResult.output as PreviewModeOutput;
        const paywallSummary = buildPaywallSummaryFromPreview({
          scenario,
          preview
        });
        setAiPreview(preview);
        setAiPaywall(paywallSummary);
        setCachedPreviewBundle({
          scenarioId: scenario.id,
          draftId: previewState.draft.id,
          preview,
          paywallSummary
        });
      })
      .catch((error) => {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : "Не удалось получить AI-вывод.";
        setAiError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsAiLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [scenario, previewState]);

  useEffect(() => {
    if (!scenario || !previewState || !aiPreview || shownTracked) return;
    if (previewState.draft.scenarioId !== scenario.id) return;

    trackEvent(ANALYTICS_EVENT_NAMES.weakPreviewShown, {
      scenario_id: scenario.id,
      draft_id: previewState.draft.id
    });
    setShownTracked(true);
  }, [scenario, previewState, aiPreview, shownTracked]);

  const confidenceLabel = useMemo(() => {
    if (!aiPreview) return "";
    if (aiPreview.confidence === "high") return "высокий";
    if (aiPreview.confidence === "medium") return "средний";
    return "ограниченный";
  }, [aiPreview]);

  if (!scenario) {
    return (
      <section className="premium-page premium-section p-8">
        <h1 className="text-2xl font-semibold">Раздел не найден</h1>
        <Link href="/" className="button-secondary mt-5 inline-flex">
          На главную
        </Link>
      </section>
    );
  }

  if (!previewState || previewState.draft.scenarioId !== scenario.id) {
    return (
      <section className="premium-page premium-section p-8">
        <h1 className="text-2xl font-semibold">Предварительный результат недоступен</h1>
        <p className="mt-3 text-sm text-[#6e6150]">Не удалось загрузить данные формы. Попробуйте отправить форму еще раз.</p>
        <Link href={scenario.route} className="button-primary mt-5 inline-flex">
          Вернуться к форме
        </Link>
      </section>
    );
  }

  if (isAiLoading) {
    return (
      <section className="premium-page premium-section p-8">
        <p className="premium-kicker">Шаг 2/3</p>
        <h1 className="mt-3 text-2xl font-semibold">Готовим предварительный вывод...</h1>
        <div className="mt-6 h-44 animate-pulse rounded-2xl bg-[#f2eadf]" />
      </section>
    );
  }

  if (!aiPreview || !aiPaywall || aiError) {
    return (
      <section className="premium-page premium-section p-8">
        <h1 className="text-2xl font-semibold">AI-слой временно недоступен</h1>
        <p className="mt-3 text-sm text-[#6e6150]">{aiError || "Не удалось построить предварительный вывод для этого черновика."}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={scenario.route} className="button-primary">
            Вернуться к форме
          </Link>
          <Link href="/" className="button-secondary">
            На главную
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="premium-page space-y-7">
      <header className="space-y-3">
        <p className="premium-kicker">Шаг 2/3 · предварительный вывод</p>
        <h1 className="display-title">Предварительный вывод готов</h1>
        <p className="premium-subtitle">{aiPreview.preview_summary}</p>
        <p className="text-sm text-[#6d6051]">
          Точность оценки: <span className="font-medium text-[#3c3125]">{confidenceLabel}</span>
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
          <AiFeatureImage
            featureKind={getFeatureKind(scenario.id)}
            alt="Иллюстрация предварительного вывода"
            className="mb-4 h-44 w-full rounded-2xl border border-[#ddcfbe] object-cover"
          />

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
              {LOCKED_ITEMS.map((item) => (
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
          </div>

          <div className="premium-note p-4 text-sm">
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

      <section className="preview-teaser-shell">
        <FullResultTeaser scenarioId={scenario.id} />
      </section>

      <section className="surface p-6 sm:p-7">
        <div className="preview-cta-wrap">
          <div>
            <p className="preview-cta-kicker">Следующий шаг</p>
            <h2 className="preview-cta-title">Откройте полный разбор, если хотите больше деталей перед покупкой</h2>
            <p className="preview-cta-text">{aiPaywall.unlock_outcome}</p>
          </div>
          <div className="preview-cta-price">
            <p className="preview-cta-price-label">Цена полного разбора</p>
            <p className="preview-cta-price-value">{scenario.priceRub} RUB</p>
          </div>
        </div>

        <TrackedLink
          href={`/checkout?scenario=${scenario.id}&draft=${previewState.draft.id}`}
          eventName={ANALYTICS_EVENT_NAMES.clickUnlockFullResult}
          eventPayload={{ scenario_id: scenario.id, draft_id: previewState.draft.id }}
          className="button-primary mt-5 inline-flex w-full justify-center sm:w-auto"
        >
          Открыть полный разбор
        </TrackedLink>
      </section>
    </section>
  );
}
