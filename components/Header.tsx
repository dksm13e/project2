import Link from "next/link";

const links = [
  { href: "/fashion", label: "Одежда" },
  { href: "/home", label: "Дом" },
  { href: "/beauty", label: "Уход" },
  { href: "/pricing", label: "Цены" },
  { href: "/faq", label: "FAQ" },
  { href: "/legal", label: "Документы" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#d2dce9] bg-[rgba(246,250,255,0.86)] backdrop-blur-xl">
      <div className="container-shell flex flex-wrap items-center justify-between gap-3 py-3.5">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.11em] text-[#243040]">
          AI Подбор покупок
        </Link>

        <nav className="order-3 flex w-full flex-wrap gap-2 text-sm sm:order-2 sm:w-auto sm:gap-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="button-ghost">
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/open-by-code" className="header-access-link order-2 sm:order-3">
          Открыть по коду
        </Link>
      </div>
    </header>
  );
}
