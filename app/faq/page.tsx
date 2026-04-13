import { faqItems } from "@/lib/content";

export default function FaqPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="pill inline-flex">FAQ</p>
        <h1 className="display-title">Частые вопросы</h1>
      </header>

      <div className="space-y-3">
        {faqItems.map((item) => (
          <details key={item.question} className="surface p-5">
            <summary className="cursor-pointer text-base font-semibold text-[#2f251b]">{item.question}</summary>
            <p className="mt-3 text-sm text-[#5b4f41]">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
