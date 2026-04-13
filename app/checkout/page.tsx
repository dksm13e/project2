import Link from "next/link";

export default function CheckoutPage() {
  return (
    <section className="card space-y-4">
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <p>Полный результат откроется сразу после оплаты. Регистрация, email и номер телефона не нужны.</p>
      <div className="rounded-xl border border-black/10 p-4 text-sm">
        <p>Продукт: персональный отчёт</p>
        <p>Стоимость: от 299 ₽</p>
        <p>Что откроется: полный результат + PDF + код доступа</p>
      </div>
      <Link href="/result/demo-token" className="cta">Оплатить и открыть результат</Link>
    </section>
  );
}
