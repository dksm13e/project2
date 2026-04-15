import Link from "next/link";
import { AiFeatureImage } from "@/components/AiFeatureImage";
import { pricingRows } from "@/lib/content";

const valueHighlights = [
  "Первый ориентир до оплаты",
  "Понятный следующий шаг перед покупкой",
  "Полный разбор только при необходимости",
  "PDF и код доступа после оплаты"
];

export default function PricingPage() {
  return (
    <section className="premium-page space-y-7">
      <header className="premium-section p-6 sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="premium-kicker">Цены и формат доступа</p>
            <h1 className="premium-title mt-3">Разовый доступ к каждому разбору</h1>
            <p className="premium-subtitle mt-3">
              Вы оплачиваете только выбранный разбор. Никаких подписок, автоматических продлений и скрытых списаний.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="pill">Без подписки</span>
              <span className="pill">Без скрытых списаний</span>
              <span className="pill">Разовая покупка</span>
            </div>
          </div>

          <div className="premium-note p-4 sm:p-5">
            <AiFeatureImage
              featureKind="pricing"
              alt="Иллюстрация страницы цен"
              className="h-40 w-full rounded-2xl border border-[#d5ddea] object-cover"
            />
            <p className="mt-3 text-sm text-[#5e6a7d]">
              Сначала вы видите предварительный вывод. Полный разбор открываете только если нужен более глубокий
              результат.
            </p>
          </div>
        </div>
      </header>

      <div className="premium-grid-cards premium-grid-cards-2 xl:grid-cols-3">
        {pricingRows.map((row) => (
          <article key={row.name} className="premium-card pricing-card p-6">
            <p className="premium-stat">Разовый разбор</p>
            <h2 className="mt-2 text-[1.45rem] font-semibold leading-tight text-[#202a37]">{row.name}</h2>
            <p className="mt-3 text-4xl font-semibold leading-none text-[#202a37]">{row.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-[#5d6a7c]">
              {row.includes.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
            <Link href="/" className="button-secondary mt-6 inline-flex w-full justify-center">
              Начать с главной
            </Link>
          </article>
        ))}
      </div>

      <section className="premium-section p-6 sm:p-8">
        <h2 className="home-section-heading">Что входит в каждый разбор</h2>
        <div className="premium-grid-cards premium-grid-cards-2 mt-5 lg:grid-cols-4">
          {valueHighlights.map((item) => (
            <article key={item} className="premium-note p-4 text-sm text-[#5f6b7d]">
              {item}
            </article>
          ))}
        </div>
        <p className="mt-5 text-sm text-[#6a7588]">
          Оплата открывает один полный результат в выбранном направлении. Повторный доступ доступен по коду.
        </p>
      </section>

      <section className="premium-note p-5 text-sm text-[#5f6b7d]">
        Продукт работает в формате цифрового сервиса: сначала короткий предварительный вывод, затем полный разбор по
        вашему решению.
      </section>
    </section>
  );
}
