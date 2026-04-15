"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AiFeatureImage } from "@/components/AiFeatureImage";
import { findTokenByAccessCode } from "@/lib/flow";
import { ANALYTICS_EVENT_NAMES, trackEvent } from "@/lib/analytics";
import { fetchRuntimeConfig } from "@/lib/ai/http";

export default function OpenByCodePage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [ttlDays, setTtlDays] = useState<number>(14);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const prefill = query.get("prefill");
    if (prefill) setCode(prefill);
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchRuntimeConfig()
      .then((config) => {
        if (!isMounted) return;
        if (typeof config.resultTtlDays === "number") {
          setTtlDays(config.resultTtlDays);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setTtlDays(14);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = findTokenByAccessCode(code);
    if (!token) {
      trackEvent(ANALYTICS_EVENT_NAMES.reopenByCodeFail, {
        code_length: code.trim().length
      });
      setSuccess("");
      setError("Код доступа не найден. Проверьте ввод и попробуйте снова.");
      return;
    }

    trackEvent(ANALYTICS_EVENT_NAMES.reopenByCodeSuccess, {
      code_length: code.trim().length
    });
    setError("");
    setSuccess("Код подтвержден. Открываем ваш результат...");
    setTimeout(() => {
      router.push(`/result/${token}`);
    }, 450);
  };

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="pill inline-flex">Повторный доступ</p>
        <h1 className="display-title">Открыть результат по коду доступа</h1>
        <p className="max-w-3xl text-[#615445]">Вставьте код, который получили после оплаты. Регистрация и личный кабинет не нужны.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <form onSubmit={onSubmit} className="surface p-6 sm:p-8">
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#3a2f22]">Код доступа</span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="input-base font-mono tracking-wider"
              placeholder="ASST-XXXX-XXXX"
              required
            />
          </label>

          <button type="submit" className="button-primary mt-5 inline-flex">
            Открыть результат
          </button>

          {error ? <p className="mt-3 text-sm text-[#a43a1f]">{error}</p> : null}
          {success ? <p className="mt-3 text-sm text-[#2b7b54]">{success}</p> : null}

          <p className="mt-5 text-xs text-[#706352]">
            Demo-код: <span className="font-mono">ASST-DEMO-2026</span>
          </p>
        </form>

        <aside className="surface-muted p-6">
          <AiFeatureImage
            featureKind="open-by-code"
            alt="Иллюстрация повторного доступа по коду"
            className="mb-4 h-40 w-full rounded-2xl border border-[#ddcfbe] object-cover"
          />

          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6e6150]">Как это работает</h2>
          <ol className="mt-3 space-y-2 text-sm text-[#584b3d]">
            <li>1. Завершите оплату в выбранном разделе.</li>
            <li>2. Сохраните код доступа из полного разбора.</li>
            <li>3. Введите код на этой странице и откройте результат повторно.</li>
          </ol>

          <div className="mt-5 rounded-xl border border-[#d9ccbb] bg-white p-4 text-sm text-[#574a3b]">
            Результат хранится {ttlDays} дней и открывается по коду доступа без регистрации.
          </div>

          <Link href="/" className="button-secondary mt-5 inline-flex">
            К подбору
          </Link>
        </aside>
      </div>
    </section>
  );
}
