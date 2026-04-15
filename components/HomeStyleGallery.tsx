"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchHomeStyleImage } from "@/lib/ai/http";
import { getScenario } from "@/lib/scenarios";

type RoomSizeVariant = "small" | "medium" | "large";

const ROOM_SIZE_OPTIONS: Array<{ value: RoomSizeVariant; label: string }> = [
  { value: "small", label: "Маленькая" },
  { value: "medium", label: "Средняя" },
  { value: "large", label: "Большая" }
];

function toImageMapKey(styleKey: string, roomSize: RoomSizeVariant): string {
  return `${styleKey}__${roomSize}`;
}

export function HomeStyleGallery() {
  const [roomSize, setRoomSize] = useState<RoomSizeVariant>("medium");
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  const styleOptions = useMemo(() => {
    const scenario = getScenario("home-room-set");
    const styleField = scenario?.fields.find((field) => field.name === "style");
    return styleField?.options ?? [];
  }, []);

  useEffect(() => {
    if (!styleOptions.length) return;
    let isMounted = true;

    Promise.all(
      styleOptions.map(async (option) => {
        const key = toImageMapKey(option.value, roomSize);
        try {
          const url = await fetchHomeStyleImage(option.value, roomSize);
          return [key, url] as const;
        } catch {
          return [key, ""] as const;
        }
      })
    ).then((entries) => {
      if (!isMounted) return;
      setImageUrls((prev) => ({
        ...prev,
        ...Object.fromEntries(entries)
      }));
    });

    return () => {
      isMounted = false;
    };
  }, [roomSize, styleOptions]);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="section-title">Визуальные стили для дома</h2>
          <p className="mt-2 text-sm text-[#645748]">
            У каждого стиля свой отдельный визуальный пример. Переключите размер комнаты, чтобы увидеть другую композицию.
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-[#d7c9b8] bg-white p-1 shadow-[0_6px_14px_rgba(28,20,12,0.08)]">
          {ROOM_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRoomSize(option.value)}
              className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm ${
                roomSize === option.value
                  ? "bg-[#2f2418] text-white shadow-[0_4px_10px_rgba(23,17,12,0.35)]"
                  : "text-[#5f5242] hover:bg-[#f6efe4]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {styleOptions.map((option) => {
          const imageKey = toImageMapKey(option.value, roomSize);
          const src = imageUrls[imageKey];

          return (
            <article key={option.value} className="group overflow-hidden rounded-2xl border border-[#d6cabc] bg-white shadow-[0_10px_26px_rgba(28,21,12,0.1)]">
              {src ? (
                <img
                  src={src}
                  alt={`Стиль ${option.label}`}
                  className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              ) : (
                <div className="h-44 w-full animate-pulse bg-[linear-gradient(120deg,#f3eadf_0%,#f9f4ec_50%,#f1e6d7_100%)]" />
              )}
              <div className="border-t border-[#ddd1c3] bg-[linear-gradient(180deg,#fff_0%,#f9f3ea_100%)] p-4">
                <h3 className="text-sm font-semibold tracking-[0.01em] text-[#2d241a]">{option.label}</h3>
                <p className="mt-1 text-xs text-[#6f6252]">
                  Формат: {ROOM_SIZE_OPTIONS.find((item) => item.value === roomSize)?.label} комната
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
