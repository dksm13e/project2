import Link from "next/link";
import { SCENARIOS } from "@/lib/scenarios";
import { ModulePageTracker } from "@/components/ModulePageTracker";

const options = [SCENARIOS["fashion-size"], SCENARIOS["fashion-fit-check"]];

const formatDetails = {
  "fashion-size": {
    title: "Подбор размера одежды",
    explanation: "Помогаем понять размер, посадку и главный риск до покупки.",
    firstLook: ["Размерный ориентир", "Посадку", "Главный риск по вещи"],
    fullLook: [
      "Основной и альтернативный размер",
      "Влияние материала",
      "Рисковые зоны",
      "Что проверить в карточке товара"
    ],
    goodFor: [
      "Сомневаетесь между двумя размерами",
      "Вещь нравится, но есть риск по посадке",
      "Не хотите ошибиться перед заказом"
    ]
  },
  "fashion-fit-check": {
    title: "Проверка сочетания в образе",
    explanation: "Помогаем понять, насколько вещь впишется в ваш образ и стиль.",
    firstLook: ["Fit-сигнал", "Главный риск сочетания", "Что может выбиваться"],
    fullLook: [
      "Сильные и слабые сочетания",
      "Триггеры mismatch",
      "Что заменить или смягчить",
      "Decision-map по образу"
    ],
    goodFor: [
      "Не уверены, впишется ли вещь в гардероб",
      "Сомневаетесь в сочетании по стилю",
      "Хотите избежать лишней покупки"
    ]
  }
} as const;

export default function FashionPage() {
  return (
    <section className="premium-page space-y-6">
      <ModulePageTracker module="fashion" page="module" />

      <header className="premium-page-header">
        <p className="premium-kicker">Одежда</p>
        <h1 className="premium-title">Подбор одежды перед покупкой</h1>
        <p className="premium-subtitle">
          Выберите формат: точный подбор размера или проверка сочетания в образе. Каждый формат даёт разный тип
          результата и отдельную логику разбора.
        </p>
      </header>

      <div className="premium-section p-6 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <div className="premium-note p-5">
            <p className="premium-stat">Сильная сторона</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1f2a39]">Спокойный первый ориентир до оплаты</h2>
            <p className="mt-2 text-sm text-[#5c6980]">
              Перед оплатой вы получите спокойный первый вывод по размеру и посадке. Полный разбор открывается только
              когда нужны детали.
            </p>
          </div>

          <div className="premium-note p-5">
            <p className="premium-stat">Форматы</p>
            <div className="segment-group mt-3">
              {options.map((item) => (
                <Link key={`seg-${item.id}`} href={item.route} className="segment-item">
                  {item.shortTitle}
                </Link>
              ))}
            </div>
            <p className="mt-3 text-xs text-[#6a778c]">Разные форматы = разная логика AI-разбора</p>
          </div>
        </div>
      </div>

      <div className="premium-grid-cards premium-grid-cards-2">
        {options.map((item) => {
          const details = formatDetails[item.id as keyof typeof formatDetails];

          return (
            <article key={item.id} className="premium-card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="premium-stat">{item.tagline}</p>
                <span className="rounded-full border border-[#c6d3e5] bg-white px-3 py-1 text-xs font-medium text-[#415069]">
                  от {item.priceRub} RUB
                </span>
              </div>

              <h3 className="mt-3 text-[1.38rem] font-semibold leading-tight text-[#1f2939]">{details.title}</h3>
              <p className="mt-2 text-sm text-[#5e6a7d]">{details.explanation}</p>

              <div className="premium-note mt-4 p-4 text-sm">
                <p className="font-medium text-[#2b3748]">Сначала вы увидите</p>
                <ul className="mt-2 space-y-1.5 text-[#5d6a7f]">
                  {details.firstLook.map((line) => (
                    <li key={line}>- {line}</li>
                  ))}
                </ul>
              </div>

              <div className="premium-note mt-3 p-4 text-sm">
                <p className="font-medium text-[#2b3748]">В полном разборе</p>
                <ul className="mt-2 space-y-1.5 text-[#5d6a7f]">
                  {details.fullLook.map((line) => (
                    <li key={line}>- {line}</li>
                  ))}
                </ul>
              </div>

              <div className="premium-note mt-3 p-4 text-sm">
                <p className="font-medium text-[#2b3748]">Подходит, если</p>
                <ul className="mt-2 space-y-1.5 text-[#5d6a7f]">
                  {details.goodFor.map((line) => (
                    <li key={line}>- {line}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-[0.14em] text-[#6f7b8f]">Разовый доступ</span>
                <Link className="button-primary" href={item.route}>
                  Начать
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
