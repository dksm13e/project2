import { faq } from "@/lib/content";

export default function FaqPage() {
  return (
    <section className="card space-y-3">
      <h1 className="text-3xl font-semibold">FAQ</h1>
      {faq.map((q) => (
        <details key={q} className="rounded-lg border border-black/10 p-3">
          <summary className="cursor-pointer font-medium">{q}</summary>
          <p className="mt-2 text-sm text-black/70">В MVP сервис работает анонимно: без аккаунта, email и телефона.</p>
        </details>
      ))}
    </section>
  );
}
