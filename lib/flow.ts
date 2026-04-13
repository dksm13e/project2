"use client";

import type { ScenarioId } from "@/lib/scenarios";
import { getScenario } from "@/lib/scenarios";

const DRAFTS_KEY = "assistant_drafts_v1";
const RESULTS_KEY = "assistant_results_v1";
const CODE_INDEX_KEY = "assistant_code_index_v1";

export type ScenarioDraft = {
  id: string;
  scenarioId: ScenarioId;
  createdAt: string;
  inputs: Record<string, string>;
};

export type WeakPreview = {
  signal: string;
  risk: string;
  nextStep: string;
  lockedModules: string[];
};

export type PurchasedResult = {
  token: string;
  accessCode: string;
  scenarioId: ScenarioId;
  draftId: string;
  createdAt: string;
  confidenceBand: string;
  executiveSummary: string;
  coreDecision: string;
  whyThis: string[];
  alternatives: string[];
  cautionFlags: string[];
  actionPlan: string[];
};

type StoredMap<T> = Record<string, T>;

const demoResult: PurchasedResult = {
  token: "demo-token",
  accessCode: "ASST-DEMO-2026",
  scenarioId: "fashion-size",
  draftId: "demo-draft",
  createdAt: new Date("2026-04-01T10:00:00.000Z").toISOString(),
  confidenceBand: "74/100",
  executiveSummary:
    "The fit direction is mostly positive, but shoulder tolerance looks tight in one size option.",
  coreDecision: "Buy only if shoulder and sleeve measurements match your baseline by <=2 cm.",
  whyThis: [
    "Body data and cut profile indicate upper-body sensitivity.",
    "The model shape in photos suggests a narrower shoulder geometry.",
    "Review trends for this item type show frequent exchange around sleeve length."
  ],
  alternatives: [
    "Try one adjacent size with a regular fit profile.",
    "Choose a similar item with a relaxed shoulder pattern.",
    "If unsure, prioritize a return-friendly seller with same-day pickup."
  ],
  cautionFlags: [
    "Ignore generic size label without garment measurements.",
    "Do not rely on photos only when seam placement matters.",
    "Avoid buying if your planned layering changes the shoulder load."
  ],
  actionPlan: [
    "Open product chart and compare shoulder, chest, and sleeve lines.",
    "Check two recent reviews with body stats close to yours.",
    "Lock final size only after verifying all three dimensions."
  ]
};

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

function makeId(prefix: string): string {
  const base = Math.random().toString(36).slice(2, 10);
  const stamp = Date.now().toString(36);
  return `${prefix}_${base}${stamp.slice(-4)}`;
}

function makeAccessCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segment = (len: number) =>
    Array.from({ length: len }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");

  return `ASST-${segment(4)}-${segment(4)}`;
}

function pick(inputs: Record<string, string>, keys: string[], fallback: string): string {
  for (const key of keys) {
    const value = inputs[key]?.trim();
    if (value) return value;
  }
  return fallback;
}

function buildWeakPreview(draft: ScenarioDraft): WeakPreview {
  const { scenarioId, inputs } = draft;

  if (scenarioId === "fashion-size") {
    const itemType = pick(inputs, ["item_type"], "selected item");
    const fit = pick(inputs, ["fit_preference"], "regular fit");

    return {
      signal: `The ${itemType} likely requires a size decision close to ${fit}.`,
      risk: "Upper-body tolerance appears narrow, so one wrong size can lead to return.",
      nextStep: "Verify shoulder and sleeve dimensions before payment.",
      lockedModules: [
        "Exact sizing branch map",
        "Alternative fit pathways",
        "Return-risk probability by condition",
        "Structured PDF export"
      ]
    };
  }

  if (scenarioId === "fashion-fit-check") {
    const styleGoal = pick(inputs, ["style_goal"], "your style goal");

    return {
      signal: `Base compatibility with ${styleGoal} is moderate, not cleanly high.`,
      risk: "The item silhouette can conflict with your intended visual balance.",
      nextStep: "Check shape contrast between item cut and your top/bottom ratio.",
      lockedModules: [
        "Styling alternatives by situation",
        "Mismatch triggers with confidence scores",
        "Keep-or-drop decision tree",
        "Structured PDF export"
      ]
    };
  }

  if (scenarioId === "home-room-set") {
    const roomType = pick(inputs, ["room_type"], "room");

    return {
      signal: `Your ${roomType} direction is coherent but budget tension is visible.`,
      risk: "The current spread can overweight one anchor item and break set balance.",
      nextStep: "Lock one anchor and re-balance secondary categories first.",
      lockedModules: [
        "Full room composition map",
        "Budget distribution across categories",
        "Fallback alternatives by priority",
        "Structured PDF export"
      ]
    };
  }

  return {
    signal: "Routine direction is viable, but active-step sequencing is still uncertain.",
    risk: "Sensitivity management may fail if product intensity order is wrong.",
    nextStep: "Validate sequence and frequency before adding new actives.",
    lockedModules: [
      "AM/PM routine architecture",
      "Ingredient conflict matrix",
      "Budget-priority replacement set",
      "Structured PDF export"
    ]
  };
}

type ResultBlueprint = Omit<PurchasedResult, "token" | "accessCode" | "draftId" | "createdAt">;

function buildFullResult(draft: ScenarioDraft): ResultBlueprint {
  const { scenarioId, inputs } = draft;

  if (scenarioId === "fashion-size") {
    const height = pick(inputs, ["height_cm"], "n/a");
    const weight = pick(inputs, ["weight_kg"], "n/a");
    const fit = pick(inputs, ["fit_preference"], "regular");

    return {
      scenarioId,
      confidenceBand: "77/100",
      executiveSummary:
        "Fit quality is likely acceptable if you choose the branch that protects shoulder and sleeve tolerance.",
      coreDecision: `Go with the ${fit} branch and verify measurements against your ${height}cm / ${weight}kg baseline.`,
      whyThis: [
        "Input profile indicates moderate sizing sensitivity in upper body.",
        "Item class and stated fit preference are directionally compatible.",
        "Risk is concentrated in one dimension, so a narrow check unlocks confidence."
      ],
      alternatives: [
        "Use the adjacent size with less aggressive taper.",
        "Pick a variant with stretch allowance in key seams.",
        "Delay purchase if seller chart misses shoulder or sleeve metrics."
      ],
      cautionFlags: [
        "Do not trust label size alone without garment dimensions.",
        "Avoid checkout if any key measurement is missing.",
        "Account for layering thickness before final confirmation."
      ],
      actionPlan: [
        "Compare three dimensions: shoulder, chest, sleeve.",
        "Validate with two review samples close to your measurements.",
        "Finalize purchase only when all dimensions stay in tolerance."
      ]
    };
  }

  if (scenarioId === "fashion-fit-check") {
    const goal = pick(inputs, ["style_goal"], "style goal");

    return {
      scenarioId,
      confidenceBand: "71/100",
      executiveSummary:
        "The item can work for your styling goal, but it needs a tighter pairing strategy to avoid visual mismatch.",
      coreDecision: `Keep the item only if supporting pieces strengthen your ${goal} intent.`,
      whyThis: [
        "Silhouette alignment is not fully automatic for your target look.",
        "Contrast between item volume and body ratio creates conditional risk.",
        "The styling outcome depends heavily on companion pieces."
      ],
      alternatives: [
        "Switch to a cleaner silhouette with fewer dependencies.",
        "Use the same item with a different bottom proportion.",
        "Replace with a lower-risk option for daily wear scenarios."
      ],
      cautionFlags: [
        "Do not evaluate fit from front-facing photo only.",
        "Avoid combining with equally dominant statement pieces.",
        "Skip if movement comfort is already borderline."
      ],
      actionPlan: [
        "Validate proportion in mirror with intended footwear.",
        "Check side profile before final decision.",
        "Keep only if both comfort and visual intent are stable."
      ]
    };
  }

  if (scenarioId === "home-room-set") {
    const budget = pick(inputs, ["budget_rub"], "your budget");
    const roomType = pick(inputs, ["room_type"], "room");

    return {
      scenarioId,
      confidenceBand: "79/100",
      executiveSummary:
        "Your room direction is strong when budget is redistributed toward foundational pieces first.",
      coreDecision: `For the ${roomType}, keep total spend near ${budget} with a 45/35/20 category split.`,
      whyThis: [
        "Primary style signal is consistent across selected preferences.",
        "Current setup risks over-investing in non-foundational items.",
        "A staged purchase sequence improves visual and budget stability."
      ],
      alternatives: [
        "Use one premium anchor and two mid-tier support items.",
        "Phase accessories into month two instead of week one.",
        "Swap one statement piece for modular storage to preserve balance."
      ],
      cautionFlags: [
        "Do not lock decor before geometry-critical items.",
        "Avoid mixing warm and cool undertones without a transition element.",
        "Skip oversized anchors in narrow circulation spaces."
      ],
      actionPlan: [
        "Lock the anchor piece and measure circulation paths.",
        "Allocate budget by category before choosing specific products.",
        "Finalize decor only after core geometry is resolved."
      ]
    };
  }

  const skinType = pick(inputs, ["skin_type"], "your skin type");
  const goal = pick(inputs, ["main_goal"], "your primary goal");

  return {
    scenarioId,
    confidenceBand: "73/100",
    executiveSummary:
      "A simplified routine structure can deliver steadier results if active intensity is sequenced carefully.",
    coreDecision: `Build around ${goal} with a ${skinType}-safe frequency ramp.`,
    whyThis: [
      "Current goals are realistic but conflict risk depends on sequence discipline.",
      "Reducing simultaneous actives improves tolerance stability.",
      "Budget can support a focused routine without unnecessary product noise."
    ],
    alternatives: [
      "Use a two-step active cycle before expanding routine length.",
      "Replace one active with barrier support during adaptation.",
      "Run a low-intensity week whenever sensitivity spikes."
    ],
    cautionFlags: [
      "Do not layer strong actives in the same introduction window.",
      "Avoid increasing frequency before reaction baseline is stable.",
      "Do not treat this plan as a medical recommendation."
    ],
    actionPlan: [
      "Establish AM/PM base for seven days.",
      "Introduce one active and monitor tolerance markers.",
      "Scale only after stable week-level response."
    ]
  };
}

export function saveDraft(scenarioId: ScenarioId, inputs: Record<string, string>): ScenarioDraft {
  const draft: ScenarioDraft = {
    id: makeId("draft"),
    scenarioId,
    createdAt: new Date().toISOString(),
    inputs
  };

  const drafts = readMap<ScenarioDraft>(DRAFTS_KEY);
  drafts[draft.id] = draft;
  writeMap(DRAFTS_KEY, drafts);

  return draft;
}

export function getDraftById(draftId: string | null | undefined): ScenarioDraft | null {
  if (!draftId) return null;
  const drafts = readMap<ScenarioDraft>(DRAFTS_KEY);
  return drafts[draftId] ?? null;
}

export function getWeakPreviewForDraft(draftId: string | null | undefined): (WeakPreview & { draft: ScenarioDraft }) | null {
  const draft = getDraftById(draftId);
  if (!draft) return null;
  return { ...buildWeakPreview(draft), draft };
}

export function createPurchasedResult(draft: ScenarioDraft): PurchasedResult {
  const token = makeId("result");
  const accessCode = makeAccessCode();
  const result: PurchasedResult = {
    ...buildFullResult(draft),
    token,
    accessCode,
    draftId: draft.id,
    createdAt: new Date().toISOString()
  };

  const resultMap = readMap<PurchasedResult>(RESULTS_KEY);
  resultMap[token] = result;
  writeMap(RESULTS_KEY, resultMap);

  const codeMap = readMap<string>(CODE_INDEX_KEY);
  codeMap[accessCode] = token;
  writeMap(CODE_INDEX_KEY, codeMap);

  return result;
}

export function getPurchasedResultByToken(token: string | null | undefined): PurchasedResult | null {
  if (!token) return null;
  if (token === demoResult.token) return demoResult;

  const resultMap = readMap<PurchasedResult>(RESULTS_KEY);
  return resultMap[token] ?? null;
}

export function normalizeAccessCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function restoreCodeFormat(normalized: string): string {
  if (!normalized.startsWith("ASST") || normalized.length < 12) {
    return normalized;
  }

  const chunkA = normalized.slice(4, 8);
  const chunkB = normalized.slice(8, 12);
  return `ASST-${chunkA}-${chunkB}`;
}

export function findTokenByAccessCode(rawCode: string): string | null {
  const normalized = normalizeAccessCode(rawCode);
  const restored = restoreCodeFormat(normalized);

  if (restored === demoResult.accessCode) {
    return demoResult.token;
  }

  const codeMap = readMap<string>(CODE_INDEX_KEY);
  return codeMap[restored] ?? null;
}

export function scenarioInputSummary(draft: ScenarioDraft): Array<{ label: string; value: string }> {
  const scenario = getScenario(draft.scenarioId);
  if (!scenario) return [];

  return scenario.fields
    .map((field) => ({ label: field.label, value: draft.inputs[field.name]?.trim() ?? "" }))
    .filter((entry) => entry.value.length > 0)
    .slice(0, 4);
}

export function resultAsPdfText(result: PurchasedResult): string {
  const scenario = getScenario(result.scenarioId);
  const title = scenario?.title ?? "AI Shopping Report";

  return [
    "AI Shopping - Полный разбор",
    `Scenario: ${title}`,
    `Generated at: ${result.createdAt}`,
    `Result token: ${result.token}`,
    `Код доступа: ${result.accessCode}`,
    "",
    "Executive summary",
    result.executiveSummary,
    "",
    "Core decision",
    result.coreDecision,
    "",
    "Why this",
    ...result.whyThis.map((line, index) => `${index + 1}. ${line}`),
    "",
    "Alternatives",
    ...result.alternatives.map((line, index) => `${index + 1}. ${line}`),
    "",
    "Caution flags",
    ...result.cautionFlags.map((line, index) => `${index + 1}. ${line}`),
    "",
    "Action plan",
    ...result.actionPlan.map((line, index) => `${index + 1}. ${line}`),
    "",
    "Disclaimer",
    "This output is informational and analytical, not a medical or legal recommendation."
  ].join("\n");
}
