const steps = [
  {
    title: "1. Выберите направление",
    text: "Одежда, дом или уход — начните с задачи, которая сейчас важнее всего."
  },
  {
    title: "2. Ответьте на короткие вопросы",
    text: "Форма занимает меньше минуты и не требует регистрации."
  },
  {
    title: "3. Получите предварительный вывод",
    text: "Вы увидите базовый сигнал и поймете, стоит ли открывать полный разбор."
  },
  {
    title: "4. Откройте полный разбор",
    text: "После оплаты доступен подробный результат с рекомендациями, альтернативами и PDF."
  },
  {
    title: "5. Сохраните код доступа",
    text: "Код нужен, чтобы открыть результат повторно без аккаунта и личного кабинета."
  }
];

export default function HowItWorksPage() {
  return (
    <section className="premium-page space-y-5">
      <header className="premium-page-header">
        <p className="premium-kicker">Как это работает</p>
        <h1 className="premium-title">Путь пользователя за 5 шагов</h1>
      </header>

      <div className="premium-grid-cards premium-grid-cards-2">
        {steps.map((step) => (
          <article key={step.title} className="premium-section p-5">
            <h2 className="text-lg font-semibold text-[#243041]">{step.title}</h2>
            <p className="mt-2 text-sm text-[#5f6b7d]">{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
