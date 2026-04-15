import type { ScenarioId } from "@/lib/scenarios";
import type { AiRouteRequest, AiRouteResult } from "@/lib/ai/router";
import type { FormHintsOutput, GuideOutput } from "@/lib/ai/schemas";

type AiRouteResponse = {
  ok: boolean;
  error?: string;
  result?: AiRouteResult;
};

type ImageResponse = {
  ok: boolean;
  error?: string;
  url?: string;
  images?: {
    welcome: string;
    step1: string;
    step2: string;
    step3: string;
  };
};

type RuntimeResponse = {
  ok: boolean;
  error?: string;
  resultTtlDays?: number;
  aiMode?: "mock" | "live";
  imageMode?: "mock" | "live";
  textLiveEnabled?: boolean;
  imageLiveEnabled?: boolean;
  textModel?: string;
  textModelCheap?: string;
  textModelFull?: string;
};

type CachedHintsEntry = {
  hints: FormHintsOutput["hints"];
  updatedAt: number;
};

type CachedGuideEntry = {
  output: GuideOutput;
  updatedAt: number;
};

const FORM_HINTS_CACHE_KEY = "assistant_ai_form_hints_cache_v1";
const GUIDE_CACHE_KEY = "assistant_ai_guide_cache_v1";
const FORM_HINTS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const GUIDE_TTL_MS = 24 * 60 * 60 * 1000;

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T;
  if (!response.ok) {
    const maybe = payload as { error?: string };
    throw new Error(maybe.error ?? `Request failed with status ${response.status}`);
  }
  return payload;
}

function readLocalMap<T>(key: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(key);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, T>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function writeLocalMap<T>(key: string, value: Record<string, T>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export async function fetchAiRoute(request: AiRouteRequest): Promise<AiRouteResult> {
  const response = await fetch("/api/ai", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  const payload = await parseJsonOrThrow<AiRouteResponse>(response);
  if (!payload.ok || !payload.result) {
    throw new Error(payload.error ?? "AI route returned empty result.");
  }

  return payload.result;
}

export async function fetchFormHints(scenarioId: ScenarioId): Promise<FormHintsOutput["hints"]> {
  const cache = readLocalMap<CachedHintsEntry>(FORM_HINTS_CACHE_KEY);
  const cached = cache[scenarioId];
  if (cached && Date.now() - cached.updatedAt <= FORM_HINTS_TTL_MS) {
    return cached.hints;
  }

  const result = await fetchAiRoute({
    scenarioId,
    mode: "form_hint"
  });
  const output = result.output as FormHintsOutput;

  cache[scenarioId] = {
    hints: output.hints,
    updatedAt: Date.now()
  };
  writeLocalMap(FORM_HINTS_CACHE_KEY, cache);

  return output.hints;
}

export async function fetchGuideOutput(): Promise<GuideOutput> {
  const cache = readLocalMap<CachedGuideEntry>(GUIDE_CACHE_KEY);
  const cached = cache.guide;
  if (cached && Date.now() - cached.updatedAt <= GUIDE_TTL_MS) {
    return cached.output;
  }

  const result = await fetchAiRoute({
    scenarioId: "guide",
    mode: "guide"
  });
  const output = result.output as GuideOutput;
  cache.guide = {
    output,
    updatedAt: Date.now()
  };
  writeLocalMap(GUIDE_CACHE_KEY, cache);
  return output;
}

export async function fetchFeatureImage(featureKind: string): Promise<string> {
  const response = await fetch(`/api/ai/image?kind=feature&featureKind=${encodeURIComponent(featureKind)}`, {
    cache: "no-store"
  });
  const payload = await parseJsonOrThrow<ImageResponse>(response);
  if (!payload.ok || !payload.url) {
    throw new Error(payload.error ?? "Feature image URL is missing.");
  }
  return payload.url;
}

export async function fetchOnboardingHelperImages(): Promise<{
  welcome: string;
  step1: string;
  step2: string;
  step3: string;
}> {
  const response = await fetch("/api/ai/image?kind=onboarding-helper-set", {
    cache: "no-store"
  });
  const payload = await parseJsonOrThrow<ImageResponse>(response);
  if (!payload.ok || !payload.images) {
    throw new Error(payload.error ?? "Onboarding images are missing.");
  }
  return payload.images;
}

export async function fetchHomeStyleImage(
  styleKey: string,
  roomSize: "small" | "medium" | "large"
): Promise<string> {
  const response = await fetch(
    `/api/ai/image?kind=home-style&styleKey=${encodeURIComponent(styleKey)}&roomSize=${encodeURIComponent(roomSize)}`,
    {
      cache: "no-store"
    }
  );
  const payload = await parseJsonOrThrow<ImageResponse>(response);
  if (!payload.ok || !payload.url) {
    throw new Error(payload.error ?? "Home style image URL is missing.");
  }
  return payload.url;
}

export async function fetchRuntimeConfig(): Promise<RuntimeResponse> {
  const response = await fetch("/api/runtime", {
    cache: "no-store"
  });
  return await parseJsonOrThrow<RuntimeResponse>(response);
}
