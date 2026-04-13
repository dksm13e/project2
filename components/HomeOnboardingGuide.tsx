"use client";

import { useEffect, useMemo, useState } from "react";
import { getAiGuideOutput } from "@/lib/ai/router";
import type { GuideStepOutput } from "@/lib/ai/outputSchemas";

type StepId = 1 | 2 | 3;

type RectState = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const STORAGE_KEY = "home_onboarding_seen_v3";

const fallbackStep: Record<StepId, GuideStepOutput> = {
  1: {
    id: 1,
    target_id: "onb-directions",
    title: "Шаг 1 из 3",
    text: "Выберите, что хотите подобрать: одежду, товары для дома или уход.",
    next_label: "Далее"
  },
  2: {
    id: 2,
    target_id: "onb-quick-info",
    title: "Шаг 2 из 3",
    text: "Сначала вы получите короткий предварительный вывод — он поможет понять, нужен ли полный разбор.",
    next_label: "Далее"
  },
  3: {
    id: 3,
    target_id: "onb-start-btn",
    title: "Шаг 3 из 3",
    text: "Нажмите сюда, ответьте на несколько вопросов и получите первый вывод.",
    next_label: "Завершить"
  }
};

export function HomeOnboardingGuide() {
  const [phase, setPhase] = useState<"welcome" | StepId | null>(null);
  const [targetRect, setTargetRect] = useState<RectState | null>(null);

  const guide = useMemo(() => getAiGuideOutput(), []);
  const activeStep = useMemo(() => (typeof phase === "number" ? phase : null), [phase]);

  const steps = useMemo<Record<StepId, GuideStepOutput>>(() => {
    const byId = new Map<number, GuideStepOutput>(guide.steps.map((step) => [step.id, step]));
    return {
      1: byId.get(1) ?? fallbackStep[1],
      2: byId.get(2) ?? fallbackStep[2],
      3: byId.get(3) ?? fallbackStep[3]
    };
  }, [guide.steps]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setPhase("welcome");
  }, []);

  useEffect(() => {
    if (!activeStep) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const target = document.getElementById(steps[activeStep].target_id);
      if (!target) {
        setTargetRect(null);
        return;
      }

      const rect = target.getBoundingClientRect();
      setTargetRect({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, { passive: true });

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [activeStep, steps]);

  const finish = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
    setPhase(null);
  };

  const start = () => setPhase(1);

  const nextStep = () => {
    if (!activeStep) return;
    if (activeStep === 3) {
      finish();
      return;
    }
    setPhase((activeStep + 1) as StepId);
  };

  if (!phase) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[#1f160f]/30 backdrop-blur-[1px]" />

      {targetRect ? (
        <div
          className="absolute rounded-2xl border-2 border-[#f6d9bb] shadow-[0_0_0_9999px_rgba(31,22,15,0.32)]"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16
          }}
        />
      ) : null}

      {phase === "welcome" ? (
        <div className="pointer-events-auto absolute left-1/2 top-1/2 w-[92%] max-w-xl -translate-x-1/2 -translate-y-1/2">
          <div className="surface p-6 sm:p-7">
            <p className="pill inline-flex">Добро пожаловать</p>
            <h2 className="mt-3 text-2xl font-semibold text-[#2e2419]">{guide.welcome_title}</h2>
            <p className="mt-2 text-sm text-[#615444]">{guide.welcome_text}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={start} className="button-primary">
                {guide.start_label}
              </button>
              <button onClick={finish} className="button-ghost text-xs">
                {guide.skip_label}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="pointer-events-auto absolute left-1/2 top-6 w-[92%] max-w-md -translate-x-1/2 sm:top-8">
          <div className="surface p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[#7a6c5b]">{steps[activeStep as StepId].title}</p>
            <p className="mt-2 text-sm text-[#5d5041]">{steps[activeStep as StepId].text}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={nextStep} className="button-primary">
                {steps[activeStep as StepId].next_label}
              </button>
              <button onClick={finish} className="button-ghost text-xs">
                {guide.skip_label}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

