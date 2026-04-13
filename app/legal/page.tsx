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
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="pill inline-flex">Legal</p>
        <h1 className="display-title">Юридическая информация</h1>
        <p className="max-w-3xl text-[#615445]">Короткие и понятные страницы по условиям использования сервиса.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {entries.map((entry) => (
          <article key={entry.href} className="surface p-6">
            <h2 className="text-lg font-semibold text-[#2f251b]">{entry.title}</h2>
            <p className="mt-2 text-sm text-[#5d5042]">{entry.description}</p>
            <Link href={entry.href} className="button-secondary mt-4 inline-flex">
              Открыть
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
