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
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title">Визуальные стили для дома</h2>
        <div className="inline-flex rounded-xl border border-[#dbcdbb] bg-white p-1">
          {ROOM_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRoomSize(option.value)}
              className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm ${
                roomSize === option.value
                  ? "bg-[#2f2418] text-white"
                  : "text-[#5f5242] hover:bg-[#f6efe4]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-[#615445]">
        Для каждого стиля подгружается отдельный визуальный пример с учетом масштаба комнаты.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {styleOptions.map((option) => {
          const imageKey = toImageMapKey(option.value, roomSize);
          const src = imageUrls[imageKey];

          return (
            <article key={option.value} className="product-card overflow-hidden p-0">
              {src ? (
                <img
                  src={src}
                  alt={`Стиль ${option.label}`}
                  className="h-36 w-full border-b border-[#ddd0c0] object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-36 w-full animate-pulse border-b border-[#ddd0c0] bg-[#f5efe6]" />
              )}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-[#2d241a]">{option.label}</h3>
                <p className="mt-1 text-xs text-[#6f6252]">Размер комнаты: {ROOM_SIZE_OPTIONS.find((item) => item.value === roomSize)?.label}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
