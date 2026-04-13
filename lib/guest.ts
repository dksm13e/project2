"use client";

const GUEST_KEY = "guest_id";
const PREVIEW_KEY = "preview_state";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

type PreviewState = {
  day: string;
  count: number;
};

function readPreviewState(): PreviewState | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(PREVIEW_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PreviewState;
  } catch {
    return null;
  }
}

function writePreviewState(state: PreviewState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREVIEW_KEY, JSON.stringify(state));
}

export function getGuestId() {
  if (typeof window === "undefined") return "";
  const saved = localStorage.getItem(GUEST_KEY);
  if (saved) return saved;

  const id = crypto.randomUUID();
  localStorage.setItem(GUEST_KEY, id);
  return id;
}

export function getPreviewUsage(limit = 3) {
  const currentDay = todayKey();
  const state = readPreviewState();
  const count = !state || state.day !== currentDay ? 0 : state.count;

  return {
    day: currentDay,
    count,
    limit,
    remaining: Math.max(limit - count, 0)
  };
}

export function canUsePreview(limit = 3) {
  return getPreviewUsage(limit).count < limit;
}

export function registerPreviewUse() {
  if (typeof window === "undefined") return;

  const usage = getPreviewUsage(3);
  writePreviewState({ day: usage.day, count: usage.count + 1 });
}