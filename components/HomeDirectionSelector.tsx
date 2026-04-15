"use client";

import { useMemo, useState } from "react";
import { SCENARIOS } from "@/lib/scenarios";
import { TrackedLink } from "@/components/TrackedLink";
import { ANALYTICS_EVENT_NAMES } from "@/lib/analytics";

type DirectionId = "fashion" | "home" | "beauty";

const directionItems: Array<{
  id: DirectionId;
  label: string;
  href: string;
  hint: string;
}> = [
  {
    id: "fashion",
    label: "Одежда",
    href: SCENARIOS["fashion-size"].route,
    hint: "Подбор размера и посадки до оплаты."
  },
  {
    id: "home",
    label: "Дом",
    href: SCENARIOS["home-room-set"].route,
    hint: "Можно добавить фото комнаты, референса и мебели."
  },
  {
    id: "beauty",
    label: "Уход",
    href: SCENARIOS["beauty-routine"].route,
    hint: "Спокойный разбор ухода: что оставить, что убрать и что не смешивать."
  }
];

export function HomeDirectionSelector() {
  const [activeDirection, setActiveDirection] = useState<DirectionId>("fashion");

  const activeItem = useMemo(
    () => directionItems.find((item) => item.id === activeDirection) ?? directionItems[0],
    [activeDirection]
  );

  return (
    <section id="onb-directions" className="home-direction-select">
      <p className="text-xs uppercase tracking-[0.16em] text-[#6b7180]">Выберите направление</p>

      <div className="segment-group mt-2">
        {directionItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveDirection(item.id)}
            className={`segment-item ${activeDirection === item.id ? "segment-item-active" : ""}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="home-direction-foot mt-3">
        <p className="home-direction-hint">{activeItem.hint}</p>
        <TrackedLink
          href={activeItem.href}
          eventName={ANALYTICS_EVENT_NAMES.heroCtaClick}
          eventPayload={{ module: activeDirection, cta_label: `Перейти: ${activeItem.label}` }}
          className="home-direction-go"
        >
          Перейти
        </TrackedLink>
      </div>
    </section>
  );
}
