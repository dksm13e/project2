const points = [
  "Помогаем принять решение перед покупкой, а не листать каталог.",
  "Работаем как независимый сервис, не связанный с маркетплейсами.",
  "Сохраняем анонимный формат: без регистрации, email и телефона."
];

export default function AboutPage() {
  return (
    <section className="premium-page space-y-6">
      <header className="premium-page-header">
        <p className="premium-kicker">О сервисе</p>
        <h1 className="premium-title">Что такое AI Подбор покупок</h1>
        <p className="premium-subtitle">
          Сервис помогает принять решение перед покупкой: сначала короткий предварительный вывод, затем полный разбор
          при необходимости.
        </p>
      </header>

      <div className="premium-section p-6 sm:p-8">
        <ul className="space-y-3 text-sm text-[#5f6c7f]">
          {points.map((point) => (
            <li key={point} className="premium-note px-4 py-3">
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className="premium-note p-4 text-sm text-[#5f6c7f]">
        Без регистрации • Без номера телефона • Повторный доступ по коду.
      </div>
    </section>
  );
}
