import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "AI Shopping",
  description:
    "Простой сервис подбора покупок: предварительный вывод, оплата, полный разбор, PDF и код доступа."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${fraunces.variable}`}>
      <body>
        <Header />
        <main className="container-shell py-8 sm:py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
