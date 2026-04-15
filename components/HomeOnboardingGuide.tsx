"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchGuideOutput, fetchOnboardingHelperImages } from "@/lib/ai/http";
import type { GuideOutput, GuideStepOutput } from "@/lib/ai/schemas";

type StepId = 1 | 2 | 3;

type RectState = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const STORAGE_KEY = "home_onboarding_seen_v4";

const FALLBACK_GUIDE: GuideOutput = {
  welcome_title: "Добро пожаловать",
  welcome_text:
    "Подскажем, как начать за минуту: выберите направление, получите предварительный вывод и при необходимости откройте полный разбор.",
  start_label: "Показать",
  skip_label: "Пропустить",
  steps: [
    {
      id: 1,
      target_id: "onb-directions",
      title: "Шаг 1 из 3",
      text: "Выберите, что хотите подобрать: одежду, товары для дома или уход.",
      next_label: "Далее"
    },
    {
      id: 2,
      target_id: "onb-quick-info",
      title: "Шаг 2 из 3",
      text: "Сначала вы получите короткий предварительный вывод — он поможет понять, нужен ли полный разбор.",
      next_label: "Далее"
    },
    {
      id: 3,
      target_id: "onb-start-btn",
      title: "Шаг 3 из 3",
      text: "Нажмите кнопку, ответьте на несколько вопросов и получите первый вывод.",
      next_label: "Готово"
    }
  ]
};

const INLINE_PLACEHOLDER_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const FALLBACK_IMAGES = {
  welcome: INLINE_PLACEHOLDER_PIXEL,
  step1: INLINE_PLACEHOLDER_PIXEL,
  step2: INLINE_PLACEHOLDER_PIXEL,
  step3: INLINE_PLACEHOLDER_PIXEL
};

function normalizeSteps(guide: GuideOutput): Record<StepId, GuideStepOutput> {
  const byId = new Map<number, GuideStepOutput>(guide.steps.map((step) => [step.id, step]));
  return {
    1: byId.get(1) ?? FALLBACK_GUIDE.steps[0],
    2: byId.get(2) ?? FALLBACK_GUIDE.steps[1],
    3: byId.get(3) ?? FALLBACK_GUIDE.steps[2]
  };
}

export function HomeOnboardingGuide() {
  const [phase, setPhase] = useState<"welcome" | StepId | null>(null);
  const [targetRect, setTargetRect] = useState<RectState | null>(null);
  const [guide, setGuide] = useState<GuideOutput>(FALLBACK_GUIDE);
  const [helperImages, setHelperImages] = useState(FALLBACK_IMAGES);

  const activeStep = useMemo(() => (typeof phase === "number" ? phase : null), [phase]);
  const steps = useMemo(() => normalizeSteps(guide), [guide]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setPhase("welcome");
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetchGuideOutput()
      .then((payload) => {
        if (!isMounted) return;
        setGuide(payload);
      })
      .catch(() => {
        if (!isMounted) return;
        setGuide(FALLBACK_GUIDE);
      });

    fetchOnboardingHelperImages()
      .then((payload) => {
        if (!isMounted) return;
        setHelperImages(payload);
      })
      .catch(() => {
        if (!isMounted) return;
        setHelperImages(FALLBACK_IMAGES);
      });

    return () => {
      isMounted = false;
    };
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

  const currentImage =
    phase === "welcome"
      ? helperImages.welcome
      : phase === 1
        ? helperImages.step1
        : phase === 2
          ? helperImages.step2
          : helperImages.step3;

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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <img
                src={currentImage}
                alt="Виртуальный помощник"
                className="h-28 w-28 rounded-2xl border border-[#ddcfbe] bg-[#f9f4ea] object-cover p-1"
                loading="lazy"
              />
              <div>
                <p className="pill inline-flex">Добро пожаловать</p>
                <h2 className="mt-3 text-2xl font-semibold text-[#2e2419]">{guide.welcome_title}</h2>
                <p className="mt-2 text-sm text-[#615444]">{guide.welcome_text}</p>
              </div>
            </div>
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
            <div className="flex items-start gap-3">
              <img
                src={currentImage}
                alt="Подсказка помощника"
                className="h-16 w-16 rounded-xl border border-[#ddcfbe] bg-[#f9f4ea] object-cover p-1"
                loading="lazy"
              />
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#7a6c5b]">{steps[activeStep as StepId].title}</p>
                <p className="mt-2 text-sm text-[#5d5041]">{steps[activeStep as StepId].text}</p>
              </div>
            </div>
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
