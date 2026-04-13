"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ANALYTICS_EVENT_NAMES, trackEvent } from "@/lib/analytics";
import { getDraftById, getPurchasedResultByToken, type PurchasedResult } from "@/lib/flow";
import { buildPdfHtmlTemplate, type PdfSection } from "@/lib/pdf-template";
import { getScenario } from "@/lib/scenarios";
import { runAiRoute } from "@/lib/ai/router";
import type {
  BeautyFullResultOutput,
  FashionFullResultOutput,
  HomeFullResultOutput,
  PdfModeOutput
} from "@/lib/ai/outputSchemas";

type FullOutput = FashionFullResultOutput | HomeFullResultOutput | BeautyFullResultOutput;

type DisplayResult = {
  mainTitle: string;
  mainDecision: string;
  keyTakeaways: string[];
  actionableRecommendations: string[];
  sections: PdfSection[];
  notes: string[];
  important: string[];
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
  if ("main_size" in full) {
    return {
      mainTitle: `Размер: ${full.main_size}`,
      mainDecision: full.fit_summary,
      keyTakeaways: [full.short_conclusion, `Уровень риска: ${full.risk_level}`, full.logic_explanation],
      actionableRecommendations: full.advice,
      sections: [
        { title: "Размер", items: [`Основной: ${full.main_size}`, `Альтернативный: ${full.alt_size}`] },
        { title: "Риски", items: full.risks },
        { title: "Что важно учесть", items: full.important_considerations }
      ],
      notes: full.important_considerations,
      important: full.risks
    };
  }

  if ("set_type" in full) {
    return {
      mainTitle: full.set_type,
      mainDecision: full.short_conclusion,
      keyTakeaways: [full.budget_vector, full.logic_explanation],
      actionableRecommendations: full.must_have,
      sections: [
        { title: "Обязательно", items: full.must_have },
        { title: "Опционально", items: full.optional },
        { title: "Композиция", items: full.composition_notes }
      ],
      notes: full.important_considerations,
      important: full.avoid
    };
  }

  return {
    mainTitle: full.routine_type,
    mainDecision: full.short_conclusion,
    keyTakeaways: [full.main_focus, full.logic_explanation],
    actionableRecommendations: [...full.am_steps, ...full.pm_steps],
    sections: [
      { title: "Утро (AM)", items: full.am_steps },
      { title: "Вечер (PM)", items: full.pm_steps },
      { title: "Опционально", items: full.optional_steps },
      { title: "Бюджет", items: full.budget_notes }
    ],
    notes: full.important_considerations,
    important: full.warnings
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
    return draft?.inputs ?? {};
  }, [result]);

  const aiFull = useMemo(() => {
    if (!result) return null;
    const routed = runAiRoute({
      scenarioId: result.scenarioId,
      mode: "full_result",
      inputs: draftInputs
    });
    return routed.output as FullOutput;
  }, [result, draftInputs]);

  const aiPdf = useMemo(() => {
    if (!result) return null;
    const routed = runAiRoute({
      scenarioId: result.scenarioId,
      mode: "pdf",
      inputs: draftInputs
    });
    return routed.output as PdfModeOutput;
  }, [result, draftInputs]);

  const structured = useMemo(() => {
    if (!aiFull) return null;
    return buildDisplayResult(aiFull);
  }, [aiFull]);

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

  if (!result || !structured || !aiPdf) {
    return (
      <section className="surface p-8">
        <h1 className="text-2xl font-semibold">Результат не найден</h1>
        <p className="mt-3 text-sm text-[#645747]">
          Этот токен не найден в локальном хранилище. Откройте результат по коду доступа или сформируйте новый.
        </p>
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

  return (
    <section className="space-y-7">
      <header className="space-y-3">
        <p className="pill inline-flex">Полный разбор</p>
        <h1 className="display-title">{scenario?.title ?? "Результат"}</h1>
        <p className="max-w-3xl text-[#5f5242]">
          Сформировано: {formatDate(result.createdAt)}. Confidence band: {result.confidenceBand}.
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
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6f6150]">PDF-отчет</h2>
            <p className="mt-2 text-sm text-[#5c4f40]">Сформирован через AI pdf mode с фиксированной структурой разделов.</p>
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
              {copyStatus === "copied" ? "Код скопирован" : copyStatus === "error" ? "Не удалось скопировать" : "Сохраните код для повторного доступа"}
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

