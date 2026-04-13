import Link from "next/link";

const links = [
  ["/fashion/size", "Fashion"],
  ["/home/room-set", "Home"],
  ["/beauty/routine", "Beauty"],
  ["/pricing", "Тарифы"],
  ["/faq", "FAQ"]
] as const;

export function Header() {
  return (
    <header className="border-b border-black/10 bg-white/95">
      <div className="container-shell flex h-16 items-center justify-between">
        <Link className="font-semibold tracking-tight" href="/">
          AI Shopping Assistant
        </Link>
        <nav className="hidden gap-5 text-sm sm:flex">
          {links.map(([href, label]) => (
            <Link key={href} className="text-black/75 hover:text-black" href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
