import { beautyDisclaimer, legalSections } from "@/lib/content";

export default function DisclaimerPage() {
  const section = legalSections.disclaimer;

  return (
    <section className="surface p-6 sm:p-8">
      <h1 className="display-title">{section.title}</h1>
      <p className="mt-3 text-sm text-[#5f5244]">{section.intro}</p>
      <ul className="mt-5 space-y-3 text-sm text-[#5a4d3e]">
        {section.items.map((line) => (
          <li key={line} className="rounded-xl border border-[#daccbb] bg-[#fbf6ee] px-4 py-3">
            {line}
          </li>
        ))}
      </ul>
      <p className="mt-5 rounded-xl border border-[#daccbb] bg-[#fbf6ee] px-4 py-3 text-sm text-[#5a4d3e]">{beautyDisclaimer}</p>
    </section>
  );
}
