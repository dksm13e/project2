"use client";

const GUEST_KEY = "guest_id";
const PREVIEW_KEY = "preview_state";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getGuestId() {
  if (typeof window === "undefined") return "";
  const saved = localStorage.getItem(GUEST_KEY);
  if (saved) return saved;
  const id = crypto.randomUUID();
  localStorage.setItem(GUEST_KEY, id);
  return id;
}

export function canUsePreview(limit = 3) {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(PREVIEW_KEY);
  const currentDay = todayKey();
  if (!raw) return true;
  const parsed = JSON.parse(raw) as { day: string; count: number };
  if (parsed.day !== currentDay) return true;
  return parsed.count < limit;
}

export function registerPreviewUse() {
  if (typeof window === "undefined") return;
  const currentDay = todayKey();
  const raw = localStorage.getItem(PREVIEW_KEY);
  if (!raw) {
    localStorage.setItem(PREVIEW_KEY, JSON.stringify({ day: currentDay, count: 1 }));
    return;
  }
  const parsed = JSON.parse(raw) as { day: string; count: number };
  const next = parsed.day === currentDay ? { day: currentDay, count: parsed.count + 1 } : { day: currentDay, count: 1 };
  localStorage.setItem(PREVIEW_KEY, JSON.stringify(next));
}
