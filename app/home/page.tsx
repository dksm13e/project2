import Link from "next/link";

export default function HomePage() {
  return (
    <section className="card space-y-3">
      <h1 className="text-3xl font-semibold">Home Assistant</h1>
      <p>В MVP доступен сценарий room-set.</p>
      <Link className="cta" href="/home/room-set">Room set</Link>
    </section>
  );
}
