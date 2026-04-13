import Link from "next/link";
import { beautyDisclaimer, legalDisclaimer } from "@/lib/content";

const legalLinks = [
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
  { href: "/legal/cookies", label: "Cookies" }
];

const productLinks = [
  { href: "/how-it-works", label: "Как это работает" },
  { href: "/pricing", label: "Цены" },
  { href: "/faq", label: "FAQ" },
  { href: "/open-by-code", label: "Код доступа" }
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#d8ccbc] bg-[#f9f4ec]">
      <div className="container-shell grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3 text-sm text-[#5f5447]">
          <p className="font-medium text-[#342a1f]">AI Shopping</p>
          <p>{legalDisclaimer}</p>
          <p>{beautyDisclaimer}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#736656]">Product</p>
          <ul className="mt-3 space-y-2 text-sm text-[#5f5345]">
            {productLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-[#2f251b]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#736656]">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-[#5f5345]">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-[#2f251b]">
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
