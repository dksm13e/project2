import type { GuideOutput } from "@/lib/ai/outputSchemas";

export function runGuideEngine(): GuideOutput {
  return {
    welcome_title: "Добро пожаловать",
    welcome_text:
      "Сейчас подскажем, как быстро начать: выбрать направление, получить предварительный вывод и перейти к полному разбору при необходимости.",
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
}

