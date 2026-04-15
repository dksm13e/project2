"use client";

import Link from "next/link";
import Image from "next/image";
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

function FashionFullResultExample({ fitCheckMode }: { fitCheckMode: boolean }) {
  return (
    <section className="checkout-example-card">
      <header className="checkout-example-head">
        <p className="checkout-example-kicker">Пример полного разбора</p>
        <h2 className="checkout-example-title">
          {fitCheckMode ? "Пример полного разбора сочетания до покупки" : "Пример полного разбора по вещи"}
        </h2>
        <p className="checkout-example-subtitle">
          Это демонстрационный образец структуры. После оплаты откроется персональная версия под ваши данные.
        </p>
      </header>

      <div className="checkout-example-grid-4">
        <article className="checkout-example-mini">
          <p>Основной размер</p>
          <strong>M</strong>
        </article>
        <article className="checkout-example-mini">
          <p>Альтернативный размер</p>
          <strong>L для более свободной посадки</strong>
        </article>
        <article className="checkout-example-mini">
          <p>Посадка</p>
          <strong>Ближе к телу в плечах, по корпусу комфортно</strong>
        </article>
        <article className="checkout-example-mini">
          <p>Главный риск</p>
          <strong>Плечи и длина рукава</strong>
        </article>
      </div>

      <div className="checkout-example-grid-3">
        <article className="checkout-example-detail">
          <h3>Что проверить перед заказом</h3>
          <p>Мерки изделия и отзывы покупателей с похожими параметрами роста и комплекции.</p>
        </article>
        <article className="checkout-example-detail">
          <h3>Как поведёт себя материал</h3>
          <p>Малорастяжимая ткань: лучше учитывать запас по свободе и не опираться только на буквенный размер.</p>
        </article>
        <article className="checkout-example-detail">
          <h3>Когда лучше взять альтернативу</h3>
          <p>Если планируете слой под вещь или предпочитаете более relaxed-fit в плечевой зоне.</p>
        </article>
      </div>

      <div className="checkout-example-next-step">
        <p className="checkout-example-next-label">Следующий шаг перед покупкой</p>
        <p className="checkout-example-next-text">
          Сверьте ключевые мерки (плечи, рукав, длина) и примите решение по размеру до оплаты заказа.
        </p>
        <p className="checkout-example-next-foot">
          После оплаты откроются полный сценарий посадки, рисковые зоны, логика по материалу, персональные рекомендации и PDF.
        </p>
      </div>
    </section>
  );
}

function HomeFullResultExample() {
  return (
    <section className="checkout-example-card checkout-example-home">
      <header className="checkout-example-head">
        <p className="checkout-example-kicker">Пример полного разбора</p>
        <h2 className="checkout-example-title">Пример полного разбора комнаты</h2>
        <p className="checkout-example-subtitle">В этом направлении вы получаете самый визуальный и структурный результат.</p>
      </header>

      <div className="checkout-home-preview-layout">
        <div className="checkout-home-preview-visual">
          <Image
            src="/style-references/home/quiet-luxury-light.svg"
            alt="Пример интерьерного визуального направления"
            width={1280}
            height={860}
            className="checkout-home-preview-image"
          />
          <p className="checkout-home-preview-caption">Визуальный ориентир: спокойная светлая база с акцентом на практичность и воздух</p>
        </div>

        <div className="checkout-home-preview-side">
          <article className="checkout-example-detail">
            <h3>Базовый вектор</h3>
            <p>Светлая спокойная база с акцентом на хранение и аккуратную композицию.</p>
          </article>
          <article className="checkout-example-detail">
            <h3>Что купить сначала</h3>
            <p>Крупные базовые предметы, световые сценарии и текстильную основу комнаты.</p>
          </article>
          <article className="checkout-example-detail">
            <h3>Что можно отложить</h3>
            <p>Мелкий декор, акцентные детали и вторичный свет до стабилизации базы.</p>
          </article>
          <article className="checkout-example-detail">
            <h3>Что важно учесть</h3>
            <p>Масштаб комнаты, проходы и сочетаемость материалов между ключевыми зонами.</p>
          </article>
        </div>
      </div>

      <div className="checkout-example-grid-3">
        <article className="checkout-example-detail">
          <h3>Приоритеты покупок</h3>
          <p>Сначала база, затем комфорт и только после этого акцентные детали.</p>
        </article>
        <article className="checkout-example-detail">
          <h3>Логика бюджета</h3>
          <p>Основной бюджет на крупные предметы и свет, декор переносится на второй этап.</p>
        </article>
        <article className="checkout-example-detail">
          <h3>Композиция</h3>
          <p>Сохраняйте проходы, визуальный центр и спокойную нагрузку по объёму.</p>
        </article>
      </div>

      <div className="checkout-example-next-step">
        <p className="checkout-example-next-label">Чего избегать</p>
        <p className="checkout-example-next-text">Лишнего мелкого декора, конфликтов материалов и перегруза акцентами.</p>
        <p className="checkout-example-next-foot">
          После оплаты откроются структура набора, приоритеты покупок, бюджетная логика, композиция и персональный визуальный вариант.
        </p>
      </div>
    </section>
  );
}

function BeautyFullResultExample() {
  return (
    <section className="checkout-example-card">
      <header className="checkout-example-head">
        <p className="checkout-example-kicker">Пример полного разбора</p>
        <h2 className="checkout-example-title">Пример полного разбора ухода</h2>
        <p className="checkout-example-subtitle">Полный результат показывает спокойную и понятную схему без лишней нагрузки на кожу.</p>
      </header>

      <div className="checkout-example-grid-3">
        <article className="checkout-example-detail">
          <h3>Базовый формат ухода</h3>
          <p>Спокойная восстанавливающая схема с минимальным числом конфликтов по активам.</p>
        </article>
        <article className="checkout-example-detail">
          <h3>Главный фокус</h3>
          <p>Защита барьера и снижение раздражения при сохранении рабочей эффективности ухода.</p>
        </article>
        <article className="checkout-example-detail">
          <h3>Основной риск перегруза</h3>
          <p>Одновременное введение нескольких активов без периода адаптации.</p>
        </article>
      </div>

      <div className="checkout-example-grid-2">
        <article className="checkout-example-detail">
          <h3>Утро</h3>
          <p>Мягкое очищение → базовое увлажнение → защита.</p>
        </article>
        <article className="checkout-example-detail">
          <h3>Вечер</h3>
          <p>Очищение → восстановление → спокойная поддержка.</p>
        </article>
      </div>

      <div className="checkout-example-grid-3">
        <article className="checkout-example-detail">
          <h3>Что убрать</h3>
          <p>Агрессивные сочетания и лишние активные шаги в одном периоде.</p>
        </article>
        <article className="checkout-example-detail">
          <h3>Что вводить аккуратно</h3>
          <p>Новые шаги постепенно, без одновременной нагрузки и с отслеживанием реакции.</p>
        </article>
        <article className="checkout-example-detail">
          <h3>Что важно учитывать</h3>
          <p>Текущую чувствительность кожи и фактическую переносимость действующих средств.</p>
        </article>
      </div>

      <p className="checkout-beauty-disclaimer">Информационный разбор ухода, не медицинское назначение.</p>
    </section>
  );
}

function FullResultExampleByScenario({ scenarioId }: { scenarioId: string }) {
  if (scenarioId === "home-room-set") return <HomeFullResultExample />;
  if (scenarioId === "beauty-routine") return <BeautyFullResultExample />;
  if (scenarioId === "fashion-fit-check") return <FashionFullResultExample fitCheckMode />;
  return <FashionFullResultExample fitCheckMode={false} />;
}

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

  const scrollToFullExample = () => {
    const target = document.getElementById("full-result-example");
    if (!target) return;

    const headerOffset = 96;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
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
    <section className="premium-page space-y-8">
      <header className="premium-page-header">
        <p className="premium-kicker">Шаг 3/3 · оплата</p>
        <h1 className="display-title">{scenario.paywallTitle}</h1>
        <p className="premium-subtitle">
          Перед оплатой вы можете посмотреть структуру полного разбора и понять, что именно откроется в вашем результате.
        </p>
      </header>

      <div className="checkout-prepay-layout">
        <article className="surface p-6 sm:p-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.15em] text-[#6a7689]">Что входит в полный разбор</p>
            <h2 className="text-2xl font-semibold text-[#1f2b39]">{aiPaywall.product_name}</h2>
            <p className="text-sm text-[#5e6b7f]">{aiPaywall.short_summary}</p>
            <p className="text-sm text-[#657389]">{aiPaywall.confidence_note}</p>
          </div>

          <div className="checkout-value-grid mt-5">
            {aiPaywall.value_bullets.slice(0, 4).map((point) => (
              <article key={point} className="checkout-value-card">
                <p className="checkout-value-label">В полном разборе</p>
                <p className="checkout-value-text">{point}</p>
              </article>
            ))}
          </div>

          <div className="checkout-inputs-card mt-5">
            <p className="text-sm font-medium text-[#2d394a]">Что учтено в вашем запросе</p>
            <ul className="mt-3 space-y-2 text-sm text-[#5b687d]">
              {inputSummary.map((entry) => (
                <li key={entry.label} className="flex items-start justify-between gap-3">
                  <span className="text-[#728097]">{entry.label}</span>
                  <span className="max-w-[58%] text-right text-[#2c3748]">{entry.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="checkout-unlock-note mt-5">
            <p>{aiPaywall.unlock_outcome}</p>
          </div>
        </article>

        <aside className="checkout-pay-sticky">
          <div className="hero-card p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[#6f7e93]">Стоимость</p>
            <p className="mt-2 text-4xl font-semibold leading-none text-[#1d2735]">{scenario.priceRub} RUB</p>
            <p className="mt-2 text-sm text-[#6f7e93]">Разовый доступ, без подписки</p>

            {!showPaymentStep ? (
              <button onClick={proceedToPayment} className="button-primary mt-5 inline-flex w-full justify-center text-base">
                Открыть полный разбор
              </button>
            ) : (
              <button
                onClick={processPayment}
                disabled={isPaying}
                className="button-primary mt-5 inline-flex w-full justify-center text-base disabled:cursor-wait disabled:opacity-70"
              >
                {isPaying ? "Обрабатываем оплату..." : "Подтвердить и открыть полный разбор"}
              </button>
            )}

            <button onClick={scrollToFullExample} className="button-secondary mt-3 inline-flex w-full justify-center">
              Посмотреть пример полного разбора
            </button>

            <p className="checkout-pay-caption mt-3">PDF и код доступа входят в результат</p>
            {paymentError ? <p className="mt-3 text-sm text-[#a0381e]">{paymentError}</p> : null}
            <p className="mt-3 text-xs text-[#6b778b]">Архитектура оплаты уже подготовлена для замены fake provider на реальный.</p>
          </div>
        </aside>
      </div>

      <section id="full-result-example" className="scroll-mt-28 space-y-4">
        <header className="premium-page-header">
          <p className="premium-kicker">Демонстрация</p>
          <h2 className="section-title">Пример полного разбора</h2>
          <p className="premium-subtitle">Ниже показан развернутый формат результата, который открывается после оплаты.</p>
        </header>

        <FullResultExampleByScenario scenarioId={scenario.id} />
      </section>

      <div className="premium-note p-4 text-sm">
        <p className="font-medium text-[#2d394a]">Важно:</p>
        <ul className="mt-2 space-y-1">
          <li>- Предварительный вывод остаётся коротким ориентиром</li>
          <li>- Полный разбор открывает всю структуру решения</li>
          <li>- Результат доступен сразу после оплаты</li>
        </ul>
      </div>
    </section>
  );
}
