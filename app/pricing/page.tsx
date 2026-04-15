import Link from "next/link";
import { AiFeatureImage } from "@/components/AiFeatureImage";
import { pricingRows } from "@/lib/content";

export default function PricingPage() {
  return (
    <section className="premium-page space-y-6">
      <header className="premium-page-header">
        <p className="premium-kicker">Цены</p>
        <h1 className="premium-title">Разовые продукты без подписки</h1>
        <p className="premium-subtitle">
          Каждый разбор оплачивается отдельно. Без рекуррентных списаний и скрытых планов.
        </p>
      </header>

      <div className="premium-grid-cards premium-grid-cards-2 xl:grid-cols-3">
        {pricingRows.map((row) => (
          <article key={row.name} className="premium-card p-6">
            <h2 className="text-xl font-semibold text-[#202a37]">{row.name}</h2>
            <p className="mt-2 text-3xl font-semibold text-[#202a37]">{row.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-[#5d6a7c]">
              {row.includes.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="premium-section p-6 text-sm text-[#5d6a7b]">
        <AiFeatureImage
          featureKind="pricing"
          alt="Иллюстрация раздела цен"
          className="mb-4 h-36 w-full rounded-2xl border border-[#d5ddea] object-cover"
        />
        <p>
          В этой версии оплата эмулируется (fake success), чтобы протестировать реалистичный пользовательский flow.
        </p>
        <Link href="/" className="button-secondary mt-4 inline-flex">
          Вернуться на главную
        </Link>
      </div>
    </section>
  );
}
