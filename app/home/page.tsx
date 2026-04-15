import Link from "next/link";
import { SCENARIOS } from "@/lib/scenarios";
import { ModulePageTracker } from "@/components/ModulePageTracker";
import { HomeStyleGallery } from "@/components/HomeStyleGallery";

const option = SCENARIOS["home-room-set"];

const homeFormats = [
  {
    title: "Базовый набор для комнаты",
    explanation: "Помогаем собрать опорный комплект без лишних покупок.",
    firstLook: ["Стартовый тип набора", "Базовый вектор бюджета", "Один ключевой риск по масштабу"],
    fullLook: ["Must-have / optional / later-buy", "Логика приоритетов", "Что можно не покупать прямо сейчас"],
    goodFor: ["Начинаете с нуля", "Нужно собрать основу спокойно", "Бюджет ограничен"]
  },
  {
    title: "Стиль и визуальный вектор",
    explanation: "Помогаем выбрать направление интерьера до траты бюджета.",
    firstLook: ["Базовый стиль", "Общий тон комнаты", "Что может визуально выбиваться"],
    fullLook: ["Композиционные принципы", "Сочетание материалов и фактур", "Цветовая логика по зонам"],
    goodFor: ["Сложно выбрать стиль", "Хотите цельный интерьер", "Есть сомнения по визуалу"]
  },
  {
    title: "Практичность и storage-first",
    explanation: "Фокус на хранении, удобстве и реальном ежедневном использовании.",
    firstLook: ["Главный функциональный приоритет", "Риск перегруза мебели", "Что отложить на второй этап"],
    fullLook: ["Практичные позиции под задачу", "Маршрут передвижения и проходы", "Материалы под быт и нагрузку"],
    goodFor: ["Нужен удобный и живой интерьер", "Есть дети или животные", "Важно не перегрузить комнату"]
  }
];

export default function HomeCategoryPage() {
  return (
    <section className="premium-page space-y-6">
      <ModulePageTracker module="home" page="module" />

      <header className="premium-page-header">
        <p className="premium-kicker">Дом</p>
        <h1 className="premium-title">Подбор для дома</h1>
        <p className="premium-subtitle">
          Помогаем собрать комнату под ваш стиль, пространство и бюджет. В этом направлении можно добавить фото
          комнаты, референса и существующей мебели для более точного вывода и более персонального результата.
        </p>
      </header>

      <article className="premium-section p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-[#1f2937]">{option.shortTitle}</h2>
        <p className="mt-2 text-sm text-[#5e6a7d]">{option.subtitle}</p>

        <div className="premium-grid-cards premium-grid-cards-2 mt-5">
          <div className="premium-note p-4 text-sm">
            <p className="font-medium text-[#2b3748]">Сначала вы увидите</p>
            <p className="mt-2">{option.weakOutcome}</p>
          </div>
          <div className="premium-note p-4 text-sm">
            <p className="font-medium text-[#2b3748]">После оплаты</p>
            <p className="mt-2">{option.fullOutcome}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link className="button-primary" href={option.route}>
            Начать
          </Link>
          <span className="premium-fineprint">Разовый доступ от {option.priceRub} RUB</span>
        </div>
      </article>

      <section className="premium-section p-6 sm:p-8">
        <h2 className="section-title">Форматы внутри направления “Дом”</h2>
        <p className="mt-2 text-sm text-[#5e6a7d]">
          Выбираем формат под вашу цель, чтобы AI-разбор сразу строился в правильной логике.
        </p>

        <div className="premium-grid-cards premium-grid-cards-2 mt-5 xl:grid-cols-3">
          {homeFormats.map((format) => (
            <article key={format.title} className="premium-card p-5">
              <h3 className="text-[1.2rem] font-semibold text-[#1f2939]">{format.title}</h3>
              <p className="mt-2 text-sm text-[#5d6a7f]">{format.explanation}</p>

              <div className="premium-note mt-4 p-4 text-sm">
                <p className="font-medium text-[#2b3748]">Сначала вы увидите</p>
                <ul className="mt-2 space-y-1.5 text-[#5d6a7f]">
                  {format.firstLook.map((line) => (
                    <li key={line}>- {line}</li>
                  ))}
                </ul>
              </div>

              <div className="premium-note mt-3 p-4 text-sm">
                <p className="font-medium text-[#2b3748]">В полном разборе</p>
                <ul className="mt-2 space-y-1.5 text-[#5d6a7f]">
                  {format.fullLook.map((line) => (
                    <li key={line}>- {line}</li>
                  ))}
                </ul>
              </div>

              <div className="premium-note mt-3 p-4 text-sm">
                <p className="font-medium text-[#2b3748]">Подходит, если</p>
                <ul className="mt-2 space-y-1.5 text-[#5d6a7f]">
                  {format.goodFor.map((line) => (
                    <li key={line}>- {line}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="premium-section p-6 sm:p-8">
        <div className="premium-note mb-5 p-4 text-sm text-[#5f6c7f]">
          Gallery ниже — это фиксированные стиль-референсы для быстрого выбора направления. В полном разборе визуал
          формируется персонально по вашим данным и фото.
        </div>
        <HomeStyleGallery />
      </div>
    </section>
  );
}
