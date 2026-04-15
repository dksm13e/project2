import Link from "next/link";
import { SCENARIOS } from "@/lib/scenarios";
import { ModulePageTracker } from "@/components/ModulePageTracker";
import { HomeStyleGallery } from "@/components/HomeStyleGallery";

const option = SCENARIOS["home-room-set"];

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
            <p className="font-medium text-[#2b3748]">Предварительный вывод</p>
            <p className="mt-2">{option.weakOutcome}</p>
          </div>
          <div className="premium-note p-4 text-sm">
            <p className="font-medium text-[#2b3748]">Полный разбор</p>
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
