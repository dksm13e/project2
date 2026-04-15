import Link from "next/link";

const entries = [
  {
    title: "Политика конфиденциальности",
    description: "Как в MVP используются только технические анонимные данные.",
    href: "/legal/privacy"
  },
  {
    title: "Пользовательское соглашение",
    description: "Условия использования цифровых разборов.",
    href: "/legal/terms"
  },
  {
    title: "Отказ от ответственности",
    description: "Границы рекомендаций и статус сервиса.",
    href: "/legal/disclaimer"
  },
  {
    title: "Cookies и Local Storage",
    description: "Какие технические данные помогают работе flow.",
    href: "/legal/cookies"
  }
];

export default function LegalIndexPage() {
  return (
    <section className="premium-page space-y-6">
      <header className="premium-page-header">
        <p className="premium-kicker">Документы</p>
        <h1 className="premium-title">Юридическая информация</h1>
        <p className="premium-subtitle">Короткие и понятные страницы по условиям использования сервиса.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {entries.map((entry) => (
          <article key={entry.href} className="premium-section p-6">
            <h2 className="text-lg font-semibold text-[#243041]">{entry.title}</h2>
            <p className="mt-2 text-sm text-[#5f6b7d]">{entry.description}</p>
            <Link href={entry.href} className="button-secondary mt-4 inline-flex">
              Открыть
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
