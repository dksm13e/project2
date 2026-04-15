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

const STORAGE_KEY = "home_onboarding_seen_v5";
const HEADER_OFFSET = 96;
const SPOTLIGHT_PADDING = 8;
const TOOLTIP_WIDTH = 360;
const TOOLTIP_HEIGHT = 220;

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

function scrollToTarget(targetId: string, behavior: ScrollBehavior = "smooth") {
  if (typeof window === "undefined") return;
  const target = document.getElementById(targetId);
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const absoluteTop = rect.top + window.scrollY;
  const destination = Math.max(0, absoluteTop - HEADER_OFFSET - 12);
  window.scrollTo({ top: destination, behavior });
}

function readRect(targetId: string): RectState | null {
  const target = document.getElementById(targetId);
  if (!target) return null;
  const rect = target.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height
  };
}

export function HomeOnboardingGuide() {
  const [phase, setPhase] = useState<"welcome" | StepId | null>(null);
  const [targetRect, setTargetRect] = useState<RectState | null>(null);
  const [guide, setGuide] = useState<GuideOutput>(FALLBACK_GUIDE);
  const [helperImages, setHelperImages] = useState(FALLBACK_IMAGES);

  const activeStep = useMemo(() => (typeof phase === "number" ? phase : null), [phase]);
  const steps = useMemo(() => normalizeSteps(guide), [guide]);

  const tooltipStyle = useMemo(() => {
    if (typeof window === "undefined" || !targetRect) {
      return {
        top: 16,
        left: 16,
        width: Math.min(TOOLTIP_WIDTH, 360)
      };
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let top = targetRect.top + targetRect.height + 14;
    if (top + TOOLTIP_HEIGHT > viewportHeight - 16) {
      top = Math.max(16, targetRect.top - TOOLTIP_HEIGHT - 14);
    }

    let left = targetRect.left;
    if (left + TOOLTIP_WIDTH > viewportWidth - 16) {
      left = viewportWidth - TOOLTIP_WIDTH - 16;
    }
    left = Math.max(16, left);

    return {
      top,
      left,
      width: Math.min(TOOLTIP_WIDTH, viewportWidth - 32)
    };
  }, [targetRect]);

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
    if (!phase || typeof window === "undefined") return;

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;
    const scrollbarCompensation = window.innerWidth - document.documentElement.clientWidth;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbarCompensation > 0) {
      body.style.paddingRight = `${scrollbarCompensation}px`;
    }

    const preventWheel = (event: Event) => {
      event.preventDefault();
    };

    const preventKeys = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", preventWheel, { passive: false });
    window.addEventListener("touchmove", preventWheel, { passive: false });
    window.addEventListener("keydown", preventKeys);

    return () => {
      window.removeEventListener("wheel", preventWheel);
      window.removeEventListener("touchmove", preventWheel);
      window.removeEventListener("keydown", preventKeys);
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPaddingRight;
    };
  }, [phase]);

  useEffect(() => {
    if (!activeStep) {
      setTargetRect(null);
      return;
    }

    const targetId = steps[activeStep].target_id;
    scrollToTarget(targetId, "smooth");

    const updateRect = () => {
      setTargetRect(readRect(targetId));
    };

    updateRect();
    const rafId = requestAnimationFrame(updateRect);
    const t1 = window.setTimeout(updateRect, 180);
    const t2 = window.setTimeout(updateRect, 380);

    window.addEventListener("resize", updateRect);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", updateRect);
    };
  }, [activeStep, steps]);

  const finish = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
    setPhase(null);
    setTargetRect(null);
  };

  const start = () => {
    setPhase(1);
  };

  const nextStep = () => {
    if (!activeStep) return;
    if (activeStep === 3) {
      finish();
      return;
    }
    const upcoming = (activeStep + 1) as StepId;
    setPhase(upcoming);
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
      <div className="absolute inset-0 bg-[#141c28]/34" />

      {targetRect && activeStep ? (
        <div
          className="absolute rounded-2xl border-2 border-[#d5e2f6] shadow-[0_0_0_9999px_rgba(20,28,40,0.34)] transition-all duration-200"
          style={{
            top: Math.max(8, targetRect.top - SPOTLIGHT_PADDING),
            left: Math.max(8, targetRect.left - SPOTLIGHT_PADDING),
            width: Math.max(24, targetRect.width + SPOTLIGHT_PADDING * 2),
            height: Math.max(24, targetRect.height + SPOTLIGHT_PADDING * 2)
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
                className="h-28 w-28 rounded-2xl border border-[#d4deec] bg-[#f6f9ff] object-cover p-1"
                loading="lazy"
              />
              <div>
                <p className="pill inline-flex">Добро пожаловать</p>
                <h2 className="mt-3 text-2xl font-semibold text-[#1f2a3a]">{guide.welcome_title}</h2>
                <p className="mt-2 text-sm text-[#5a677b]">{guide.welcome_text}</p>
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
        <div
          className="pointer-events-auto absolute"
          style={{
            top: tooltipStyle.top,
            left: tooltipStyle.left,
            width: tooltipStyle.width
          }}
        >
          <div className="surface p-5">
            <div className="flex items-start gap-3">
              <img
                src={currentImage}
                alt="Подсказка помощника"
                className="h-16 w-16 rounded-xl border border-[#d4deec] bg-[#f6f9ff] object-cover p-1"
                loading="lazy"
              />
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#6c7890]">{steps[activeStep as StepId].title}</p>
                <p className="mt-2 text-sm text-[#5a677b]">{steps[activeStep as StepId].text}</p>
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
