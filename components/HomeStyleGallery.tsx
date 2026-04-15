"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getScenario } from "@/lib/scenarios";
import { fetchHomeStyleImage } from "@/lib/ai/http";

const STYLE_REFERENCE_IMAGES: Record<string, { src: string; note: string }> = {
  minimalism: {
    src: "/style-references/home/minimalism.svg",
    note: "Чистые линии и свободный воздух."
  },
  "warm-minimal": {
    src: "/style-references/home/warm-minimal.svg",
    note: "Минимализм в более тёплой гамме."
  },
  scandi: {
    src: "/style-references/home/scandi.svg",
    note: "Светлая база и мягкая функциональность."
  },
  japandi: {
    src: "/style-references/home/japandi.svg",
    note: "Спокойный баланс японского и сканди-подхода."
  },
  "modern-clean": {
    src: "/style-references/home/modern-clean.svg",
    note: "Ровная геометрия и современная чистота."
  },
  "soft-loft": {
    src: "/style-references/home/soft-loft.svg",
    note: "Лофт-подача с более мягким тоном."
  },
  "modern-organic": {
    src: "/style-references/home/modern-organic.svg",
    note: "Современный интерьер с органичными формами."
  },
  "quiet-luxury-light": {
    src: "/style-references/home/quiet-luxury-light.svg",
    note: "Сдержанный светлый premium без лишнего декора."
  },
  "natural-neutral": {
    src: "/style-references/home/natural-neutral.svg",
    note: "Нейтральная палитра и природные фактуры."
  },
  "cozy-basic": {
    src: "/style-references/home/cozy-basic.svg",
    note: "Базовый уютный интерьер на каждый день."
  },
  "storage-first": {
    src: "/style-references/home/storage-first.svg",
    note: "Акцент на хранение и порядок."
  },
  "compact-studio": {
    src: "/style-references/home/compact-studio.svg",
    note: "Рациональная планировка для небольшого пространства."
  },
  "hotel-like-calm": {
    src: "/style-references/home/hotel-like-calm.svg",
    note: "Спокойная атмосфера в духе boutique-отеля."
  },
  "soft-feminine": {
    src: "/style-references/home/soft-feminine.svg",
    note: "Мягкий пластичный интерьер с деликатными акцентами."
  },
  "masculine-clean": {
    src: "/style-references/home/masculine-clean.svg",
    note: "Графичная сдержанная композиция."
  },
  "family-practical": {
    src: "/style-references/home/family-practical.svg",
    note: "Практичный формат для семьи."
  },
  "rental-light": {
    src: "/style-references/home/rental-light.svg",
    note: "Лёгкие решения для арендного жилья."
  },
  "workspace-functional": {
    src: "/style-references/home/workspace-functional.svg",
    note: "Функциональный фокус на рабочем сценарии."
  },
  "dark-accent-modern": {
    src: "/style-references/home/dark-accent-modern.svg",
    note: "Современная база с тёмными акцентами."
  },
  "light-premium-simple": {
    src: "/style-references/home/light-premium-simple.svg",
    note: "Светлый premium в чистой лаконичной подаче."
  }
};

const STYLE_FILTERS = [
  { id: "all", label: "Все" },
  { id: "calm", label: "Спокойнее" },
  { id: "light", label: "Светлее" },
  { id: "warm", label: "Теплее" },
  { id: "practical", label: "Практичнее" },
  { id: "compact", label: "Компактнее" },
  { id: "soft", label: "Мягче" },
  { id: "modern", label: "Современнее" }
] as const;

const STYLE_TAGS: Record<string, string[]> = {
  minimalism: ["calm", "light", "modern"],
  "warm-minimal": ["calm", "warm", "light"],
  scandi: ["light", "soft", "practical"],
  japandi: ["calm", "warm", "soft"],
  "modern-clean": ["modern", "light", "calm"],
  "soft-loft": ["soft", "warm", "modern"],
  "modern-organic": ["modern", "soft", "warm"],
  "quiet-luxury-light": ["calm", "light", "modern"],
  "natural-neutral": ["calm", "warm", "soft"],
  "cozy-basic": ["warm", "soft", "practical"],
  "storage-first": ["practical", "compact", "modern"],
  "compact-studio": ["compact", "practical", "light"],
  "hotel-like-calm": ["calm", "soft", "light"],
  "soft-feminine": ["soft", "warm", "calm"],
  "masculine-clean": ["modern", "calm", "practical"],
  "family-practical": ["practical", "soft", "warm"],
  "rental-light": ["compact", "practical", "light"],
  "workspace-functional": ["practical", "modern", "compact"],
  "dark-accent-modern": ["modern", "calm"],
  "light-premium-simple": ["light", "calm", "modern"]
};

type FilterId = (typeof STYLE_FILTERS)[number]["id"];

export function HomeStyleGallery() {
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const requestedStylesRef = useRef<Set<string>>(new Set());

  const styleOptions = useMemo(() => {
    const scenario = getScenario("home-room-set");
    const styleField = scenario?.fields.find((field) => field.name === "style");
    return styleField?.options ?? [];
  }, []);

  const filteredOptions = useMemo(() => {
    if (activeFilter === "all") return styleOptions;
    return styleOptions.filter((option) => (STYLE_TAGS[option.value] ?? []).includes(activeFilter));
  }, [styleOptions, activeFilter]);

  useEffect(() => {
    let isMounted = true;

    styleOptions.forEach((option) => {
      if (requestedStylesRef.current.has(option.value)) return;
      requestedStylesRef.current.add(option.value);

      fetchHomeStyleImage(option.value, "medium")
        .then((url) => {
          if (!isMounted) return;
          setImageMap((current) => {
            if (current[option.value] === url) return current;
            return {
              ...current,
              [option.value]: url
            };
          });
        })
        .catch(() => {
          // Keep fallback static reference.
        });
    });

    return () => {
      isMounted = false;
    };
  }, [styleOptions]);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="section-title">Визуальные стили для дома</h2>
        <p className="mt-2 text-sm text-[#5e6a7c]">
          Для каждого стиля подгружается отдельный фото-референс. Эти карточки помогают быстро увидеть разницу между
          направлениями до начала разбора.
        </p>
      </div>

      <div className="style-filter-row">
        {STYLE_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setActiveFilter(filter.id)}
            className={`style-filter-chip ${activeFilter === filter.id ? "style-filter-chip-active" : ""}`}
          >
            {filter.label}
          </button>
        ))}
        <span className="style-filter-meta">
          Показано {filteredOptions.length} из {styleOptions.length}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {filteredOptions.map((option) => {
          const fallback = STYLE_REFERENCE_IMAGES[option.value];
          const resolvedSrc = imageMap[option.value] ?? fallback?.src ?? "/style-references/home/minimalism.svg";

          return (
            <article key={option.value} className="premium-card group overflow-hidden">
              <img
                src={resolvedSrc}
                alt={`Стиль ${option.label}`}
                className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="border-t border-[#d7e0ed] bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(247,251,255,0.9)_100%)] p-4">
                <p className="text-[0.66rem] uppercase tracking-[0.14em] text-[#77859a]">Фото-референс</p>
                <h3 className="mt-1 text-sm font-semibold tracking-[0.01em] text-[#243041]">{option.label}</h3>
                <p className="mt-1 text-xs text-[#657283]">{fallback?.note ?? "Отдельный визуальный референс стиля."}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
