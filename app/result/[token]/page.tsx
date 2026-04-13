export default async function ResultPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <section className="space-y-5">
      <h1 className="text-3xl font-semibold">Полный результат</h1>
      <div className="card">
        <p className="text-sm text-black/70">Token: {token}</p>
        <h2 className="mt-2 text-xl font-medium">Что открыто после оплаты</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-black/80">
          <li>Детальные рекомендации и альтернативы.</li>
          <li>Логика выбора и блок «что ещё проверить перед покупкой».</li>
          <li>PDF-отчёт и код доступа для повторного открытия.</li>
        </ul>
      </div>
      <div className="card">
        <p className="text-sm">Код доступа: <span className="font-semibold">ASST-9K2M-44</span></p>
        <div className="mt-3 flex gap-2">
          <button className="cta">Скопировать код</button>
          <button className="cta">Скачать PDF</button>
        </div>
      </div>
    </section>
  );
}
