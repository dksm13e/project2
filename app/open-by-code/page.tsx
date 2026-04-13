export default function OpenByCodePage() {
  return (
    <section className="card space-y-4">
      <h1 className="text-3xl font-semibold">Открыть результат по коду</h1>
      <input className="w-full rounded-lg border border-black/15 px-3 py-2" placeholder="Введите access code" />
      <button className="cta">Открыть результат</button>
    </section>
  );
}
