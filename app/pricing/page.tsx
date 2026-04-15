import Link from "next/link";
import { AiFeatureImage } from "@/components/AiFeatureImage";
import { pricingRows } from "@/lib/content";

export default function PricingPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="pill inline-flex">Цены</p>
        <h1 className="display-title">Разовые продукты без подписки</h1>
        <p className="max-w-3xl text-[#605344]">
          Каждый разбор оплачивается отдельно. Никаких рекуррентных платежей и скрытых планов.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {pricingRows.map((row) => (
          <article key={row.name} className="product-card p-6">
            <h2 className="text-xl font-semibold text-[#2d241a]">{row.name}</h2>
            <p className="mt-2 text-2xl font-semibold text-[#2b2117]">{row.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-[#584c3d]">
              {row.includes.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="surface-muted p-6 text-sm text-[#5b4f40]">
        <AiFeatureImage
          featureKind="pricing"
          alt="Иллюстрация раздела цен"
          className="mb-4 h-36 w-full rounded-2xl border border-[#ddcfbe] object-cover"
        />
        <p>В этой версии оплата эмулируется (fake success), чтобы протестировать реалистичный пользовательский flow.</p>
        <Link href="/" className="button-secondary mt-4 inline-flex">
          Вернуться к направлениям
        </Link>
      </div>
    </section>
  );
}
