"use client";

type DraftImageMap = Record<string, Record<string, string>>;

const DRAFT_IMAGES_KEY = "assistant_draft_images_v1";

function readImageMap(): DraftImageMap {
  if (typeof window === "undefined") return {};
  const raw = sessionStorage.getItem(DRAFT_IMAGES_KEY);
  if (!raw) return {};

  try {
    return (JSON.parse(raw) as DraftImageMap) ?? {};
  } catch {
    return {};
  }
}

function writeImageMap(map: DraftImageMap) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DRAFT_IMAGES_KEY, JSON.stringify(map));
}

export function saveDraftImageInputs(draftId: string, images: Record<string, string>) {
  if (!draftId) return;
  const map = readImageMap();
  const hasImages = Object.values(images).some((value) => typeof value === "string" && value.trim().length > 0);

  if (hasImages) {
    map[draftId] = images;
  } else {
    delete map[draftId];
  }

  const entries = Object.entries(map);
  if (entries.length > 16) {
    const trimmed = entries.slice(entries.length - 16);
    writeImageMap(Object.fromEntries(trimmed));
    return;
  }

  writeImageMap(map);
}

export function getDraftImageInputs(draftId: string | null | undefined): Record<string, string> {
  if (!draftId) return {};
  const map = readImageMap();
  return map[draftId] ?? {};
}

export function mergeInputsWithDraftImages(
  draftId: string | null | undefined,
  inputs: Record<string, string>
): Record<string, string> {
  return {
    ...inputs,
    ...getDraftImageInputs(draftId)
  };
}
