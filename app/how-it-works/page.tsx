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
    text: "После оплаты доступен полный результат с рекомендациями, альтернативами и PDF."
  },
  {
    title: "5. Сохраните код доступа",
    text: "Код нужен, чтобы открыть результат повторно без аккаунта и личного кабинета."
  }
];

export default function HowItWorksPage() {
  return (
    <section className="space-y-5">
      <header className="space-y-3">
        <p className="pill inline-flex">Как это работает</p>
        <h1 className="display-title">Путь пользователя за 5 шагов</h1>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {steps.map((step) => (
          <article key={step.title} className="surface p-5">
            <h2 className="text-lg font-semibold text-[#2f251b]">{step.title}</h2>
            <p className="mt-2 text-sm text-[#5a4d3e]">{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
