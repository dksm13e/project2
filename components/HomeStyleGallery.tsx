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
          <p className="mt-2 text-sm text-[#5e6a7c]">
            У каждого стиля свой отдельный визуальный пример. Переключите размер комнаты, чтобы увидеть другую
            композицию.
          </p>
        </div>
        <div className="segment-group">
          {ROOM_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRoomSize(option.value)}
              className={`segment-item ${roomSize === option.value ? "segment-item-active" : ""}`}
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
            <article key={option.value} className="premium-card group overflow-hidden">
              {src ? (
                <img
                  src={src}
                  alt={`Стиль ${option.label}`}
                  className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              ) : (
                <div className="h-44 w-full animate-pulse bg-[linear-gradient(120deg,#eef3fb_0%,#f5f9ff_50%,#e8eff8_100%)]" />
              )}
              <div className="border-t border-[#d7e0ed] bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(247,251,255,0.9)_100%)] p-4">
                <h3 className="text-sm font-semibold tracking-[0.01em] text-[#243041]">{option.label}</h3>
                <p className="mt-1 text-xs text-[#657283]">
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
