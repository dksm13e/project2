import { getAiRuntimeConfig, requestStructuredJson } from "@/lib/ai/client";
import { getLiveSystemPrompt, getLiveUserPrompt } from "@/lib/ai/prompts";
import type { GuideOutput, GuideStepOutput } from "@/lib/ai/schemas";
import { validateAiOutput } from "@/lib/ai/schemas";

const FALLBACK_GUIDE_OUTPUT: GuideOutput = {
  welcome_title: "Добро пожаловать",
  welcome_text:
    "Сейчас подскажем, как быстро начать: выбрать направление, получить предварительный вывод и при необходимости открыть полный разбор.",
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
      text: "Нажмите сюда, ответьте на несколько вопросов и получите первый вывод.",
      next_label: "Завершить"
    }
  ]
};

function normalizeGuideOutput(value: GuideOutput): GuideOutput {
  const safeSteps = [1, 2, 3].map((index) => {
    const found = value.steps.find((step) => step.id === index);
    return found ?? FALLBACK_GUIDE_OUTPUT.steps[index - 1];
  });

  return {
    welcome_title: value.welcome_title || FALLBACK_GUIDE_OUTPUT.welcome_title,
    welcome_text: value.welcome_text || FALLBACK_GUIDE_OUTPUT.welcome_text,
    start_label: value.start_label || FALLBACK_GUIDE_OUTPUT.start_label,
    skip_label: value.skip_label || FALLBACK_GUIDE_OUTPUT.skip_label,
    steps: safeSteps
  };
}

export function runGuideEngine(): GuideOutput {
  return FALLBACK_GUIDE_OUTPUT;
}

export async function generateGuideOutput(context: Record<string, string> = {}): Promise<GuideOutput> {
  const runtime = getAiRuntimeConfig();
  if (!runtime.textLiveEnabled) {
    return FALLBACK_GUIDE_OUTPUT;
  }

  try {
    const candidate = await requestStructuredJson<GuideOutput>({
      task: "guide.output",
      systemPrompt: getLiveSystemPrompt("guide", "guide"),
      userPrompt: getLiveUserPrompt({
        domain: "guide",
        mode: "guide",
        inputs: context,
        interpretation: {
          fallback_targets: FALLBACK_GUIDE_OUTPUT.steps.map((step) => step.target_id)
        },
        baselineOutput: FALLBACK_GUIDE_OUTPUT
      }),
      maxOutputTokens: 260
    });

    if (!validateAiOutput("guide", "guide", candidate)) {
      return FALLBACK_GUIDE_OUTPUT;
    }

    return normalizeGuideOutput(candidate);
  } catch {
    return FALLBACK_GUIDE_OUTPUT;
  }
}

export async function generateGuideStep(
  stepId: 1 | 2 | 3,
  context: Record<string, string> = {}
): Promise<GuideStepOutput> {
  const output = await generateGuideOutput(context);
  return output.steps.find((step) => step.id === stepId) ?? FALLBACK_GUIDE_OUTPUT.steps[stepId - 1];
}
