"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ANALYTICS_EVENT_NAMES, trackEvent } from "@/lib/analytics";
import { AiFeatureImage } from "@/components/AiFeatureImage";
import { getDraftById, getPurchasedResultByToken, type PurchasedResult } from "@/lib/flow";
import { mergeInputsWithDraftImages } from "@/lib/flow-images";
import { buildPdfHtmlTemplate, type PdfSection } from "@/lib/pdf-template";
import { getScenario } from "@/lib/scenarios";
import { fetchAiRoute } from "@/lib/ai/http";
import { getCachedFullResult, setCachedFullResult } from "@/lib/ai/cache";
import { buildPdfPayloadFromFullResult } from "@/lib/ai/pdf";
import type { BeautyFullResultOutput, FashionFullResultOutput, HomeFullResultOutput } from "@/lib/ai/schemas";

type FullOutput = FashionFullResultOutput | HomeFullResultOutput | BeautyFullResultOutput;

type DisplayResult = {
  mainTitle: string;
  mainDecision: string;
  confidenceLine: string;
  keyTakeaways: string[];
  actionableRecommendations: string[];
  sections: PdfSection[];
  notes: string[];
  important: string[];
  alternatives: string[];
  verifyList: string[];
  avoidList: string[];
  simplified: string[];
  limitations: string[];
};

function formatDate(iso: string) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function buildDisplayResult(full: FullOutput): DisplayResult {
  const confidenceLine = `Точность: ${full.confidence_level.toUpperCase()} (${full.confidence_score}/100)`;

  if ("main_size" in full) {
    return {
      mainTitle: `${full.recognized_category}: ${full.main_size} (alt ${full.alt_size})`,
      mainDecision: full.primary_recommendation,
      confidenceLine,
      keyTakeaways: [full.summary, full.logic_of_choice, ...full.reasoning],
      actionableRecommendations: full.action_steps,
      sections: [
        { title: "Категория и размер", items: [full.recognized_category, `Основной: ${full.main_size}`, `Альтернативный: ${full.alt_size}`] },
        { title: "Материал", items: full.material_impact },
        { title: "Зоны риска", items: full.key_risk_zones },
        { title: "Что может сместить рекомендацию", items: full.recommendation_shift_factors }
      ],
      notes: full.interpretation_notes,
      important: full.risks,
      alternatives: full.alternatives,
      verifyList: full.pre_purchase_checks,
      avoidList: full.what_to_avoid,
      simplified: full.simplified_variant,
      limitations: full.interpretation_limitations
    };
  }

  if ("set_type" in full) {
    return {
      mainTitle: `${full.set_type} — ${full.visual_strategy}`,
      mainDecision: full.primary_recommendation,
      confidenceLine,
      keyTakeaways: [full.summary, ...full.reasoning],
      actionableRecommendations: full.action_steps,
      sections: [
        { title: "Must-have", items: full.must_have },
        { title: "Optional", items: full.optional_positions },
        { title: "Later-buy", items: full.later_buy },
        { title: "Масштаб и композиция", items: [...full.scale_recommendations, ...full.composition_logic] },
        { title: "Материалы и цвет", items: [...full.material_tips, ...full.color_tips] },
        { title: "Что не покупать сейчас", items: full.skip_for_now }
      ],
      notes: full.interpretation_notes,
      important: full.risks,
      alternatives: full.alternatives,
      verifyList: full.what_to_verify,
      avoidList: full.avoid_mistakes,
      simplified: full.simplified_variant,
      limitations: full.interpretation_limitations
    };
  }

  return {
    mainTitle: `${full.routine_type}: ${full.main_focus}`,
    mainDecision: full.primary_recommendation,
    confidenceLine,
    keyTakeaways: [full.summary, ...full.reasoning],
    actionableRecommendations: full.action_steps,
    sections: [
      { title: "AM", items: full.am_steps },
      { title: "PM", items: full.pm_steps },
      { title: "Must-have", items: full.must_have_steps },
      { title: "Optional", items: full.optional_steps },
      { title: "Что убрать", items: full.remove_steps },
      { title: "Что не сочетать", items: full.avoid_combinations },
      { title: "Ввод шагов", items: full.introduction_plan },
      { title: "Бюджет", items: full.budget_structure }
    ],
    notes: full.interpretation_notes,
    important: [...full.risks, ...full.warnings],
    alternatives: full.alternatives,
    verifyList: full.what_to_verify,
    avoidList: full.what_to_avoid,
    simplified: full.simplified_variant,
    limitations: full.interpretation_limitations
  };
}

function openPrintWindow(html: string) {
  const popup = window.open("", "_blank", "noopener,noreferrer");
  if (!popup) return false;

  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();

  setTimeout(() => {
    popup.print();
  }, 220);

  return true;
}

function downloadHtmlFallback(filename: string, html: string) {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

export default function ResultPage() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  const [result, setResult] = useState<PurchasedResult | null>(null);
  const [aiFull, setAiFull] = useState<FullOutput | null>(null);
  const [aiError, setAiError] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [shownTracked, setShownTracked] = useState(false);

  useEffect(() => {
    setResult(getPurchasedResultByToken(token));
  }, [token]);

  const scenario = useMemo(() => {
    if (!result) return null;
    return getScenario(result.scenarioId);
  }, [result]);

  const draftInputs = useMemo(() => {
    if (!result) return {};
    const draft = getDraftById(result.draftId);
    if (!draft) return {};
    return mergeInputsWithDraftImages(result.draftId, draft.inputs);
  }, [result]);

  useEffect(() => {
    if (!result) {
      setAiFull(null);
      setAiError("");
      setIsAiLoading(false);
      return;
    }

    const cached = getCachedFullResult(result.scenarioId, result.token);
    if (cached) {
      setAiFull(cached);
      setAiError("");
      setIsAiLoading(false);
      return;
    }

    let isMounted = true;
    setIsAiLoading(true);
    setAiError("");

    fetchAiRoute({
      scenarioId: result.scenarioId,
      mode: "full_result",
      inputs: draftInputs
    })
      .then((fullResult) => {
        if (!isMounted) return;
        const full = fullResult.output as FullOutput;
        setAiFull(full);
        setCachedFullResult({
          scenarioId: result.scenarioId,
          token: result.token,
          fullResult: full
        });
      })
      .catch((error) => {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : "Не удалось загрузить полный результат.";
        setAiError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsAiLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [result, draftInputs]);

  const structured = useMemo(() => {
    if (!aiFull) return null;
    return buildDisplayResult(aiFull);
  }, [aiFull]);

  const aiPdf = useMemo(() => {
    if (!aiFull || !scenario) return null;
    return buildPdfPayloadFromFullResult(aiFull, scenario.title);
  }, [aiFull, scenario]);

  useEffect(() => {
    if (!result || shownTracked) return;

    trackEvent(ANALYTICS_EVENT_NAMES.resultShown, {
      scenario_id: result.scenarioId,
      result_token: result.token
    });

    setShownTracked(true);
  }, [result, shownTracked]);

  const downloadPdf = () => {
    if (!result || !scenario || !aiPdf) return;

    trackEvent(ANALYTICS_EVENT_NAMES.pdfDownloaded, {
      scenario_id: result.scenarioId,
      result_token: result.token
    });

    const html = buildPdfHtmlTemplate({
      result,
      scenario,
      summary: aiPdf.summary,
      recommendations: aiPdf.recommendations,
      sections: aiPdf.sections,
      notes: aiPdf.notes,
      disclaimer: aiPdf.disclaimer
    });

    const opened = openPrintWindow(html);
    if (!opened) {
      downloadHtmlFallback(`ai-shopping-report-${result.token}.html`, html);
    }
  };

  const copyCode = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.accessCode);
      setCopyStatus("copied");
      trackEvent(ANALYTICS_EVENT_NAMES.accessCodeCopied, {
        scenario_id: result.scenarioId,
        result_token: result.token
      });
    } catch {
      setCopyStatus("error");
    }
  };

  if (!result) {
    return (
      <section className="surface p-8">
        <h1 className="text-2xl font-semibold">Результат не найден</h1>
        <p className="mt-3 text-sm text-[#645747]">
          Этот токен не найден в локальном хранилище. Откройте результат по коду доступа или сформируйте новый.
        </p>
        <AiFeatureImage
          featureKind="result-empty"
          alt="Пустое состояние результата"
          className="mt-5 h-44 w-full rounded-2xl border border-[#ddcfbe] object-cover"
        />
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/open-by-code" className="button-primary">
            Открыть по коду
          </Link>
          <Link href="/" className="button-secondary">
            На главную
          </Link>
        </div>
      </section>
    );
  }

  if (isAiLoading) {
    return (
      <section className="surface p-8">
        <p className="pill inline-flex">Полный разбор</p>
        <h1 className="mt-3 text-2xl font-semibold">Готовим полный результат...</h1>
        <div className="mt-6 h-44 animate-pulse rounded-2xl bg-[#f2eadf]" />
      </section>
    );
  }

  if (!structured || !aiPdf || aiError) {
    return (
      <section className="surface p-8">
        <h1 className="text-2xl font-semibold">Полный результат временно недоступен</h1>
        <p className="mt-3 text-sm text-[#645747]">{aiError || "Не удалось сформировать AI-результат для этого токена."}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/open-by-code" className="button-primary">
            Открыть другой результат
          </Link>
          <Link href="/" className="button-secondary">
            На главную
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-7">
      <header className="space-y-3">
        <p className="pill inline-flex">Полный разбор</p>
        <h1 className="display-title">{scenario?.title ?? "Результат"}</h1>
        <p className="max-w-3xl text-[#5f5242]">
          Сформировано: {formatDate(result.createdAt)}. {structured.confidenceLine}.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="space-y-4">
          <div className="surface p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.14em] text-[#726455]">Основной вывод</p>
            <div className="mt-3 rounded-xl border border-[#d8cab8] bg-[#fbf6ef] p-4">
              <h2 className="text-lg font-semibold text-[#2f251b]">{structured.mainTitle}</h2>
              <p className="mt-2 text-sm text-[#534636]">{structured.mainDecision}</p>
            </div>
          </div>

          <div className="surface p-6 sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6f6150]">Рекомендации к действию</h3>
            <ol className="mt-3 space-y-2 text-sm text-[#594c3d]">
              {structured.actionableRecommendations.map((item, index) => (
                <li key={item}>
                  {index + 1}. {item}
                </li>
              ))}
            </ol>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {structured.sections.map((section) => (
              <div key={section.title} className="surface p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6f6150]">{section.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#574a3b]">
                  {section.items.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="surface p-6 sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6f6150]">Логика выбора</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#584b3d]">
              {structured.keyTakeaways.map((line) => (
                <li key={line}>- {line}</li>
              ))}
            </ul>
          </div>

          <div className="surface p-6 sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6f6150]">Альтернативы и упрощенный вариант</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#584b3d]">
              {structured.alternatives.map((line) => (
                <li key={line}>- {line}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs uppercase tracking-[0.12em] text-[#7a6d5d]">Упрощенный вариант</p>
            <ul className="mt-2 space-y-2 text-sm text-[#584b3d]">
              {structured.simplified.map((line) => (
                <li key={line}>- {line}</li>
              ))}
            </ul>
          </div>
        </article>

        <aside className="space-y-4">
          <div className="surface-muted p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6f6150]">Что важно учесть</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#5a4d3f]">
              {structured.important.map((line) => (
                <li key={line}>- {line}</li>
              ))}
            </ul>
          </div>

          <div className="surface-muted p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6f6150]">Что проверить</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#5a4d3f]">
              {structured.verifyList.map((line) => (
                <li key={line}>- {line}</li>
              ))}
            </ul>
          </div>

          <div className="surface-muted p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6f6150]">Чего избегать</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#5a4d3f]">
              {structured.avoidList.map((line) => (
                <li key={line}>- {line}</li>
              ))}
            </ul>
          </div>

          <div className="surface-muted p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6f6150]">Ограничения интерпретации</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#5a4d3f]">
              {(structured.limitations.length ? structured.limitations : ["Ограничения не критичны по текущему вводу."]).map((line) => (
                <li key={line}>- {line}</li>
              ))}
            </ul>
          </div>

          <div className="surface-muted p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6f6150]">PDF-отчет</h2>
            <p className="mt-2 text-sm text-[#5c4f40]">Сформирован на основе структурированного результата и готов к сохранению/печати.</p>
            <button onClick={downloadPdf} className="button-primary mt-4 inline-flex w-full justify-center">
              Скачать PDF
            </button>
          </div>

          <div className="surface-muted p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6f6150]">Код доступа</h2>
            <p className="mt-2 rounded-xl border border-[#d7c8b5] bg-white px-3 py-2 font-mono text-sm tracking-wider text-[#34291d]">
              {result.accessCode}
            </p>
            <button onClick={copyCode} className="button-secondary mt-3 inline-flex w-full justify-center">
              Скопировать код
            </button>
            <p className="mt-2 text-xs text-[#6f6252]">
              {copyStatus === "copied"
                ? "Код скопирован"
                : copyStatus === "error"
                  ? "Не удалось скопировать"
                  : "Сохраните код для повторного доступа"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#dccfbe] bg-white p-4 text-sm text-[#5c4f40]">
            {structured.notes.map((line) => (
              <p key={line} className="mt-1 first:mt-0">
                - {line}
              </p>
            ))}
          </div>

          <Link href="/open-by-code" className="button-secondary inline-flex w-full justify-center">
            Проверить доступ по коду
          </Link>
        </aside>
      </div>
    </section>
  );
}
