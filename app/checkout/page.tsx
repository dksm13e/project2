"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPurchasedResult, getDraftById, scenarioInputSummary, type ScenarioDraft } from "@/lib/flow";
import { getScenario } from "@/lib/scenarios";
import { runCheckoutPayment } from "@/lib/payments/checkout";
import { ANALYTICS_EVENT_NAMES, trackEvent } from "@/lib/analytics";
import { getCachedPaywallSummary, setCachedPaywallSummary } from "@/lib/ai/cache";
import { buildFallbackPaywallSummaryFromScenario } from "@/lib/ai/paywall";
import type { PaywallSummaryOutput } from "@/lib/ai/schemas";

type QueryState = {
  scenarioId: string | null;
  draftId: string | null;
};

export default function CheckoutPage() {
  const router = useRouter();

  const [queryState, setQueryState] = useState<QueryState>({ scenarioId: null, draftId: null });
  const [draft, setDraft] = useState<ScenarioDraft | null>(null);
  const [aiPaywall, setAiPaywall] = useState<PaywallSummaryOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [aiError, setAiError] = useState("");
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paywallTracked, setPaywallTracked] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setQueryState({
      scenarioId: query.get("scenario"),
      draftId: query.get("draft")
    });
  }, []);

  const scenario = getScenario(queryState.scenarioId);

  useEffect(() => {
    setDraft(getDraftById(queryState.draftId));
  }, [queryState.draftId]);

  useEffect(() => {
    if (!scenario || !draft || draft.scenarioId !== scenario.id) {
      setAiPaywall(null);
      setAiError("");
      setIsAiLoading(false);
      return;
    }

    const cached = getCachedPaywallSummary(scenario.id, draft.id);
    if (cached) {
      setAiPaywall(cached);
      setAiError("");
      setIsAiLoading(false);
      return;
    }

    const fallbackPaywall = buildFallbackPaywallSummaryFromScenario(scenario);
    setAiPaywall(fallbackPaywall);
    setCachedPaywallSummary({
      scenarioId: scenario.id,
      draftId: draft.id,
      paywallSummary: fallbackPaywall
    });
    setAiError("");
    setIsAiLoading(false);
  }, [scenario, draft]);

  useEffect(() => {
    if (!scenario || !draft || draft.scenarioId !== scenario.id || paywallTracked) return;

    trackEvent(ANALYTICS_EVENT_NAMES.paywallShown, {
      scenario_id: scenario.id,
      draft_id: draft.id,
      amount_rub: scenario.priceRub
    });

    setPaywallTracked(true);
  }, [scenario, draft, paywallTracked]);

  const inputSummary = useMemo(() => {
    if (!draft) return [];
    return scenarioInputSummary(draft);
  }, [draft]);

  if (!scenario || !draft || draft.scenarioId !== scenario.id) {
    return (
      <section className="premium-page premium-section p-8">
        <h1 className="text-2xl font-semibold">Контекст оплаты не найден</h1>
        <p className="mt-3 text-sm text-[#5f6b7d]">Не удалось найти данные из предварительного вывода.</p>
        <Link href="/" className="button-primary mt-5 inline-flex">
          На главную
        </Link>
      </section>
    );
  }

  if (isAiLoading) {
    return (
      <section className="premium-page premium-section p-8">
        <p className="premium-kicker">Шаг 3/3 · оплата</p>
        <h1 className="mt-3 text-2xl font-semibold">Готовим экран оплаты...</h1>
        <div className="mt-6 h-44 animate-pulse rounded-2xl bg-[#e9eff8]" />
      </section>
    );
  }

  if (!aiPaywall || aiError) {
    return (
      <section className="premium-page premium-section p-8">
        <h1 className="text-2xl font-semibold">Экран оплаты временно недоступен</h1>
        <p className="mt-3 text-sm text-[#5f6b7d]">{aiError || "Не удалось подготовить краткий вывод перед оплатой."}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/preview/${scenario.id}?draft=${draft.id}`} className="button-primary">
            Вернуться к предварительному выводу
          </Link>
          <Link href="/" className="button-secondary">
            На главную
          </Link>
        </div>
      </section>
    );
  }

  const proceedToPayment = () => {
    trackEvent(ANALYTICS_EVENT_NAMES.clickProceedToPayment, {
      scenario_id: scenario.id,
      stage: "paywall_preflight"
    });

    setShowPaymentStep(true);
  };

  const processPayment = async () => {
    if (isPaying) return;

    setIsPaying(true);
    setPaymentError("");

    trackEvent(ANALYTICS_EVENT_NAMES.clickProceedToPayment, {
      scenario_id: scenario.id,
      stage: "provider_confirmation"
    });

    try {
      const outcome = await runCheckoutPayment({
        scenarioId: scenario.id,
        draftId: draft.id,
        amountRub: scenario.priceRub,
        currency: "RUB",
        description: scenario.paywallTitle,
        metadata: {
          scenario_title: scenario.title,
          module: scenario.categoryRoute.replace("/", "")
        }
      });

      if (outcome.result.status !== "succeeded") {
        setPaymentError(outcome.result.errorMessage ?? "Оплата не прошла. Повторите попытку.");
        setIsPaying(false);
        return;
      }

      trackEvent(ANALYTICS_EVENT_NAMES.paymentSuccess, {
        scenario_id: scenario.id,
        amount_rub: scenario.priceRub,
        provider: outcome.providerName,
        payment_session_id: outcome.session.sessionId,
        transaction_id: outcome.result.providerTransactionId ?? null
      });

      const result = createPurchasedResult(draft);
      router.push(`/result/${result.token}`);
    } catch {
      setPaymentError("Не удалось завершить оплату. Повторите попытку.");
      setIsPaying(false);
    }
  };

  return (
    <section className="premium-page space-y-7">
      <header className="premium-page-header">
        <p className="premium-kicker">Шаг 3/3 · оплата</p>
        <h1 className="display-title">{scenario.paywallTitle}</h1>
        <p className="premium-subtitle">
          Разовая покупка цифрового разбора. Без подписки, без регистрации, без номера телефона.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="surface p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#253142]">{aiPaywall.product_name}</h2>
          <p className="mt-3 text-sm text-[#5b687d]">{aiPaywall.short_summary}</p>
          <p className="mt-2 text-sm text-[#66758b]">{aiPaywall.confidence_note}</p>
          <ul className="mt-4 space-y-2 text-sm text-[#5b687d]">
            {aiPaywall.value_bullets.map((point) => (
              <li key={point}>- {point}</li>
            ))}
          </ul>

          <div className="premium-note mt-5 p-4">
            <p className="text-sm font-medium text-[#2d394a]">Ваши данные</p>
            <ul className="mt-3 space-y-2 text-sm text-[#5b687d]">
              {inputSummary.map((entry) => (
                <li key={entry.label} className="flex items-start justify-between gap-3">
                  <span className="text-[#728097]">{entry.label}</span>
                  <span className="max-w-[58%] text-right text-[#2c3748]">{entry.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="premium-note mt-5 p-4">
            <p className="text-sm font-medium text-[#2d394a]">Что откроется после оплаты</p>
            <ul className="mt-3 space-y-2 text-sm text-[#5b687d]">
              {aiPaywall.value_bullets.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-[#5b687d]">{aiPaywall.unlock_outcome}</p>
          </div>
        </article>

        <aside className="space-y-4">
          <div className="hero-card p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[#6f7e93]">Стоимость</p>
            <p className="mt-2 text-4xl font-semibold leading-none text-[#1d2735]">{scenario.priceRub} RUB</p>
            <p className="mt-2 text-sm text-[#6f7e93]">Разовый платеж</p>

            {!showPaymentStep ? (
              <button onClick={proceedToPayment} className="button-primary mt-5 inline-flex w-full justify-center text-base">
                Перейти к оплате
              </button>
            ) : (
              <button
                onClick={processPayment}
                disabled={isPaying}
                className="button-primary mt-5 inline-flex w-full justify-center text-base disabled:cursor-wait disabled:opacity-70"
              >
                {isPaying ? "Обрабатываем оплату..." : "Оплатить и открыть полный разбор"}
              </button>
            )}

            {paymentError ? <p className="mt-3 text-sm text-[#a0381e]">{paymentError}</p> : null}
            <p className="mt-3 text-xs text-[#6b778b]">Сейчас используется fake payment provider с готовой архитектурой для замены на реальный.</p>
          </div>

          <div className="premium-note p-4 text-sm">
            <p className="font-medium text-[#2d394a]">Гарантия UX:</p>
            <ul className="mt-2 space-y-1">
              <li>- Без регистрации</li>
              <li>- Без email и телефона</li>
              <li>- Полный результат откроется сразу</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
