const tariffs = [
  "Fashion Size Report — от 199 ₽",
  "Fashion Fit Report — от 299 ₽",
  "Home Set — от 490 ₽",
  "Beauty Routine — от 299 ₽",
  "Extended Report — от 690 ₽"
];

export default function PricingPage() {
  return (
    <section className="card space-y-4">
      <h1 className="text-3xl font-semibold">Тарифы</h1>
      <p>Не подписка. Только разовые продукты.</p>
      <ul className="list-disc pl-5">
        {tariffs.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </section>
  );
}
