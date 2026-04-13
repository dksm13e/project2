"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { canUsePreview, getGuestId, registerPreviewUse } from "@/lib/guest";

type Props = {
  title: string;
  fields: Array<{ name: string; label: string; placeholder?: string }>;
  checkoutLabel: string;
};

export function ScenarioForm({ title, fields, checkoutLabel }: Props) {
  const [showPreview, setShowPreview] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    getGuestId();
    setLimitReached(!canUsePreview(3));
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canUsePreview(3)) {
      setLimitReached(true);
      return;
    }
    registerPreviewUse();
    setShowPreview(true);
  };

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <form onSubmit={submit} className="card space-y-4">
        {fields.map((field) => (
          <label className="block text-sm" key={field.name}>
            <span className="mb-1 block text-black/70">{field.label}</span>
            <input
              required
              name={field.name}
              placeholder={field.placeholder}
              className="w-full rounded-lg border border-black/15 px-3 py-2"
            />
          </label>
        ))}
        <button className="cta" type="submit">
          Получить weak preview
        </button>
        <p className="text-xs text-black/60">Регистрация, email и телефон не нужны. Доступ к результату — по коду.</p>
      </form>

      {limitReached && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
          Лимит weak preview на сегодня исчерпан (3/день для одного guest_id). Завтра лимит обновится.
        </div>
      )}

      {showPreview && (
        <div className="card space-y-4 border-amber-200 bg-amber-50/50">
          <h2 className="text-xl font-medium">Базовый preview готов</h2>
          <p>
            Мы подготовили базовый preview по вашему запросу. Полный результат включает детальные
            рекомендации, сценарии выбора и PDF-отчёт.
          </p>
          <ul className="list-disc space-y-1 pl-6 text-sm text-black/70">
            <li>Что уже понятно: 1 ключевой вывод + 1 риск + 1 краткая рекомендация.</li>
            <li>Скрыто: детальная логика, альтернативы, бюджет, полный сценарий.</li>
          </ul>
          <Link className="cta" href="/checkout">
            {checkoutLabel}
          </Link>
        </div>
      )}
    </section>
  );
}
