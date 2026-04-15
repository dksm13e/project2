import { legalSections } from "@/lib/content";

export default function PrivacyPage() {
  const section = legalSections.privacy;

  return (
    <section className="premium-page premium-section p-6 sm:p-8">
      <h1 className="display-title">{section.title}</h1>
      <p className="premium-subtitle mt-3">{section.intro}</p>
      <ul className="mt-5 space-y-3 text-sm text-[#5f6b7d]">
        {section.items.map((line) => (
          <li key={line} className="premium-note px-4 py-3">
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}

