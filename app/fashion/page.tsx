import Link from "next/link";

export default function FashionPage() {
  return (
    <section className="card space-y-3">
      <h1 className="text-3xl font-semibold">Fashion Assistant</h1>
      <p>Выберите сценарий: размер или fit-check.</p>
      <div className="flex gap-3">
        <Link className="cta" href="/fashion/size">Size</Link>
        <Link className="cta" href="/fashion/fit-check">Fit-check</Link>
      </div>
    </section>
  );
}
