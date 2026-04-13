import Link from "next/link";

export default function BeautyPage() {
  return (
    <section className="card space-y-3">
      <h1 className="text-3xl font-semibold">Beauty Assistant</h1>
      <p>В MVP доступен сценарий routine.</p>
      <Link className="cta" href="/beauty/routine">Routine</Link>
    </section>
  );
}
