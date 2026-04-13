const points = [
  "Помогаем принять решение перед покупкой, а не листать каталог.",
  "Работаем как независимый сервис, не связанный с маркетплейсами.",
  "Сохраняем анонимный формат: без регистрации, email и телефона."
];

export default function AboutPage() {
  return (
    <section className="surface p-6 sm:p-8">
      <h1 className="display-title">О продукте</h1>
      <p className="mt-3 max-w-3xl text-[#5f5244]">
        AI Shopping помогает выбрать и не ошибиться с покупкой через понятный путь:
        короткая форма, предварительный вывод, оплата и полный разбор с PDF и кодом доступа.
      </p>

      <ul className="mt-5 space-y-3 text-sm text-[#564a3c]">
        {points.map((point) => (
          <li key={point} className="rounded-xl border border-[#dccfbe] bg-[#fbf6ef] px-4 py-3">
            {point}
          </li>
        ))}
      </ul>
    </section>
  );
}
