import Link from "next/link";
import { beautyDisclaimer, legalDisclaimer } from "@/lib/content";

const legalLinks = [
  { href: "/legal/privacy", label: "Конфиденциальность" },
  { href: "/legal/terms", label: "Соглашение" },
  { href: "/legal/disclaimer", label: "Дисклеймер" },
  { href: "/legal/cookies", label: "Cookies и Local Storage" }
];

const productLinks = [
  { href: "/how-it-works", label: "Как это работает" },
  { href: "/pricing", label: "Цены" },
  { href: "/faq", label: "FAQ" },
  { href: "/open-by-code", label: "Код доступа" }
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#d2dce9] bg-[rgba(245,249,255,0.86)]">
      <div className="container-shell grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3 text-sm text-[#637084]">
          <p className="font-medium text-[#243040]">AI Подбор покупок</p>
          <p>{legalDisclaimer}</p>
          <p>{beautyDisclaimer}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#768295]">Разделы</p>
          <ul className="mt-3 space-y-2 text-sm text-[#637084]">
            {productLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-[#273241]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#768295]">Документы</p>
          <ul className="mt-3 space-y-2 text-sm text-[#637084]">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-[#273241]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
