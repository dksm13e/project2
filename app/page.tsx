import Link from "next/link";
import { faq } from "@/lib/content";

const scenarios = [
  {
    href: "/fashion/size",
    title: "Fashion Assistant",
    text: "Подбор размера и fit-check с weak preview и детальным full report.",
    afterPay: "Размер, альтернативы, риски и PDF"
  },
  {
    href: "/home/room-set",
    title: "Home Assistant",
    text: "Сборка сетов для комнаты или кухни с акцентом на бюджет.",
    afterPay: "Полный сет, композиция и PDF"
  },
  {
    href: "/beauty/routine",
    title: "Beauty Assistant",
    text: "Подбор routine без регистрации и лишних шагов.",
    afterPay: "Шаги ухода, предупреждения и PDF"
  }
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-4xl font-semibold">AI-помощник для выбора покупок</h1>
        <p className="max-w-3xl text-black/70">
          Одежда, товары для дома и beauty — с быстрым preview и полным подбором после оплаты.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className="cta" href="/fashion/size">Подобрать одежду</Link>
          <Link className="cta" href="/home/room-set">Собрать сет для дома</Link>
          <Link className="cta" href="/beauty/routine">Подобрать beauty routine</Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {scenarios.map((card) => (
          <article key={card.href} className="card">
            <h2 className="text-xl font-medium">{card.title}</h2>
            <p className="mt-2 text-sm text-black/70">{card.text}</p>
            <p className="mt-3 text-sm">После оплаты: {card.afterPay}</p>
            <Link className="mt-4 inline-block text-sm underline" href={card.href}>Перейти</Link>
          </article>
        ))}
      </section>

      <section className="card">
        <h2 className="text-2xl font-medium">Как это работает</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-black/80">
          <li>Выберите сценарий.</li>
          <li>Вставьте ссылку или ответьте на вопросы.</li>
          <li>Получите weak preview.</li>
          <li>Откройте полный результат после оплаты.</li>
        </ol>
      </section>

      <section className="card">
        <h2 className="text-2xl font-medium">FAQ</h2>
        <ul className="mt-3 space-y-1 text-black/75">
          {faq.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
