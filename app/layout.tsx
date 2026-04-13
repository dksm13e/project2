import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "AI-помощник по выбору покупок",
  description: "Fashion / Home / Beauty ассистент с weak preview и paywall логикой"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Header />
        <main className="container-shell py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
