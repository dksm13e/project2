import type { ScenarioId } from "@/lib/scenarios";
import type {
  BeautyFullResultOutput,
  FashionFullResultOutput,
  HomeFullResultOutput,
  PaywallSummaryOutput,
  PreviewModeOutput
} from "@/lib/ai/schemas";

type CachedPreviewBundle = {
  scenarioId: ScenarioId;
  draftId: string;
  preview: PreviewModeOutput;
  paywallSummary: PaywallSummaryOutput;
  updatedAt: number;
};

type CachedFullResult = {
  scenarioId: ScenarioId;
  token: string;
  fullResult: FashionFullResultOutput | HomeFullResultOutput | BeautyFullResultOutput;
  updatedAt: number;
};

type CachedPaywallSummary = {
  scenarioId: ScenarioId;
  draftId: string;
  paywallSummary: PaywallSummaryOutput;
  updatedAt: number;
};

type StoredMap<T> = Record<string, T>;

const PREVIEW_CACHE_KEY = "assistant_ai_preview_cache_v1";
const FULL_RESULT_CACHE_KEY = "assistant_ai_full_result_cache_v1";
const PAYWALL_CACHE_KEY = "assistant_ai_paywall_cache_v1";

const PREVIEW_CACHE_TTL_MS = 48 * 60 * 60 * 1000;
const FULL_RESULT_CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const PAYWALL_CACHE_TTL_MS = 48 * 60 * 60 * 1000;

function readMap<T>(key: string): StoredMap<T> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(key);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as StoredMap<T>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function writeMap<T>(key: string, value: StoredMap<T>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function previewCacheKey(scenarioId: ScenarioId, draftId: string): string {
  return `${scenarioId}::${draftId}`;
}

function fullResultCacheKey(scenarioId: ScenarioId, token: string): string {
  return `${scenarioId}::${token}`;
}

export function getCachedPreviewBundle(
  scenarioId: ScenarioId,
  draftId: string
): { preview: PreviewModeOutput; paywallSummary: PaywallSummaryOutput } | null {
  const map = readMap<CachedPreviewBundle>(PREVIEW_CACHE_KEY);
  const key = previewCacheKey(scenarioId, draftId);
  const entry = map[key];
  if (!entry) return null;

  if (Date.now() - entry.updatedAt > PREVIEW_CACHE_TTL_MS) {
    delete map[key];
    writeMap(PREVIEW_CACHE_KEY, map);
    return null;
  }

  return {
    preview: entry.preview,
    paywallSummary: entry.paywallSummary
  };
}

export function setCachedPreviewBundle(params: {
  scenarioId: ScenarioId;
  draftId: string;
  preview: PreviewModeOutput;
  paywallSummary: PaywallSummaryOutput;
}) {
  const map = readMap<CachedPreviewBundle>(PREVIEW_CACHE_KEY);
  const key = previewCacheKey(params.scenarioId, params.draftId);
  map[key] = {
    scenarioId: params.scenarioId,
    draftId: params.draftId,
    preview: params.preview,
    paywallSummary: params.paywallSummary,
    updatedAt: Date.now()
  };
  writeMap(PREVIEW_CACHE_KEY, map);
  setCachedPaywallSummary({
    scenarioId: params.scenarioId,
    draftId: params.draftId,
    paywallSummary: params.paywallSummary
  });
}

export function getCachedPaywallSummary(
  scenarioId: ScenarioId,
  draftId: string
): PaywallSummaryOutput | null {
  const map = readMap<CachedPaywallSummary>(PAYWALL_CACHE_KEY);
  const key = previewCacheKey(scenarioId, draftId);
  const entry = map[key];

  if (entry) {
    if (Date.now() - entry.updatedAt <= PAYWALL_CACHE_TTL_MS) {
      return entry.paywallSummary;
    }

    delete map[key];
    writeMap(PAYWALL_CACHE_KEY, map);
  }

  return getCachedPreviewBundle(scenarioId, draftId)?.paywallSummary ?? null;
}

export function setCachedPaywallSummary(params: {
  scenarioId: ScenarioId;
  draftId: string;
  paywallSummary: PaywallSummaryOutput;
}) {
  const map = readMap<CachedPaywallSummary>(PAYWALL_CACHE_KEY);
  const key = previewCacheKey(params.scenarioId, params.draftId);
  map[key] = {
    scenarioId: params.scenarioId,
    draftId: params.draftId,
    paywallSummary: params.paywallSummary,
    updatedAt: Date.now()
  };
  writeMap(PAYWALL_CACHE_KEY, map);
}

export function getCachedFullResult(
  scenarioId: ScenarioId,
  token: string
): FashionFullResultOutput | HomeFullResultOutput | BeautyFullResultOutput | null {
  const map = readMap<CachedFullResult>(FULL_RESULT_CACHE_KEY);
  const key = fullResultCacheKey(scenarioId, token);
  const entry = map[key];
  if (!entry) return null;

  if (Date.now() - entry.updatedAt > FULL_RESULT_CACHE_TTL_MS) {
    delete map[key];
    writeMap(FULL_RESULT_CACHE_KEY, map);
    return null;
  }

  return entry.fullResult;
}

export function setCachedFullResult(params: {
  scenarioId: ScenarioId;
  token: string;
  fullResult: FashionFullResultOutput | HomeFullResultOutput | BeautyFullResultOutput;
}) {
  const map = readMap<CachedFullResult>(FULL_RESULT_CACHE_KEY);
  const key = fullResultCacheKey(params.scenarioId, params.token);
  map[key] = {
    scenarioId: params.scenarioId,
    token: params.token,
    fullResult: params.fullResult,
    updatedAt: Date.now()
  };
  writeMap(FULL_RESULT_CACHE_KEY, map);
}
