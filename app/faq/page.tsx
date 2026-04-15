import { faqItems } from "@/lib/content";

export default function FaqPage() {
  return (
    <section className="premium-page space-y-6">
      <header className="premium-page-header">
        <p className="premium-kicker">FAQ</p>
        <h1 className="premium-title">Частые вопросы</h1>
      </header>

      <div className="space-y-3">
        {faqItems.map((item) => (
          <details key={item.question} className="premium-section p-5">
            <summary className="cursor-pointer text-base font-semibold text-[#232d3a]">{item.question}</summary>
            <p className="mt-3 text-sm text-[#5f6b7d]">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
