import type { Metadata } from "next";
import { Manrope, Prata } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap"
});

const prata = Prata({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  weight: ["400"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "AI Подбор покупок",
  description:
    "Простой сервис подбора покупок: предварительный вывод, оплата, полный разбор, PDF и код доступа."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${prata.variable}`}>
      <body>
        <Header />
        <main className="container-shell py-8 sm:py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
