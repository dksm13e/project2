import { beautyDisclaimer, legalDisclaimer } from "@/lib/content";

export default function DisclaimerPage() {
  return (
    <section className="card space-y-2">
      <h1 className="text-2xl font-semibold">Disclaimer</h1>
      <p>{legalDisclaimer}</p>
      <p>{beautyDisclaimer}</p>
    </section>
  );
}
