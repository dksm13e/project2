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
  { href: "/open-by-code", label: "Открыть по коду" }
];

const startLinks = [
  { href: "/fashion", label: "Одежда" },
  { href: "/home", label: "Дом" },
  { href: "/beauty", label: "Уход" }
];

export function Footer() {
  return (
    <footer className="site-footer mt-16">
      <div className="container-shell space-y-7 py-10">
        <section className="site-footer-hero">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[#79859a]">AI Подбор покупок</p>
            <h2 className="mt-3 text-2xl font-semibold text-[#1e2938]">Выбирайте спокойнее перед оплатой</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#5f6c7f]">
              Один сервис для одежды, дома и ухода: сначала предварительный вывод, затем полный разбор при
              необходимости.
            </p>
          </div>

          <div className="site-footer-start">
            {startLinks.map((item) => (
              <Link key={item.href} href={item.href} className="button-secondary">
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-[1.3fr_1fr_1fr]">
          <div className="space-y-3 text-sm text-[#637084]">
            <p>{legalDisclaimer}</p>
            <p>{beautyDisclaimer}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#768295]">Продукт</p>
            <ul className="mt-3 space-y-2 text-sm text-[#637084]">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="site-footer-link">
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
                  <Link href={link.href} className="site-footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </footer>
  );
}
