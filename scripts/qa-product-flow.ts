import { createPurchasedResult, findTokenByAccessCode, getPurchasedResultByToken, getWeakPreviewForDraft, saveDraft } from "@/lib/flow";
import { canUsePreview, getPreviewUsage, registerPreviewUse } from "@/lib/guest";
import { runCheckoutPayment } from "@/lib/payments/checkout";
import { getScenario } from "@/lib/scenarios";
import { runAiRoute } from "@/lib/ai/router";

class MemoryStorage {
  private map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }
}

const memoryStorage = new MemoryStorage();

const fakeWindow = {
  localStorage: memoryStorage,
  location: { pathname: "/qa-flow" }
} as unknown as Window;

Object.defineProperty(globalThis, "window", {
  value: fakeWindow,
  configurable: true
});

Object.defineProperty(globalThis, "localStorage", {
  value: memoryStorage,
  configurable: true
});

type FlowCase = {
  scenarioId: "fashion-size" | "home-room-set" | "beauty-routine";
  inputs: Record<string, string>;
};

const CASES: FlowCase[] = [
  {
    scenarioId: "fashion-size",
    inputs: {
      product_url: "https://example.com/fashion",
      product_title: "Heavy hoodie",
      item_category: "худи",
      height_cm: "176",
      weight_kg: "70",
      desired_fit: "regular",
      usual_size: "M",
      brand: "UnknownBrandX",
      material_composition: "80% cotton, 20% polyester"
    }
  },
  {
    scenarioId: "home-room-set",
    inputs: {
      room_type: "bedroom",
      style: "japandi",
      budget_rub: "140000",
      room_area: "16",
      room_shape: "square",
      ceiling_height: "standard",
      main_goal: "storage",
      existing_items: "bed",
      reference_url: ""
    }
  },
  {
    scenarioId: "beauty-routine",
    inputs: {
      skin_type: "combination",
      concerns: "dehydration",
      sensitivity_level: "medium",
      experience_level: "basic",
      desired_steps: "3-4",
      routine_time: "both",
      budget_rub: "6000",
      current_routine: "cleanser + moisturizer"
    }
  }
];

let failures = 0;
const summary: Array<Record<string, unknown>> = [];

for (const entry of CASES) {
  const scenario = getScenario(entry.scenarioId);
  if (!scenario) {
    failures += 1;
    console.log(`FAIL scenario-not-found id=${entry.scenarioId}`);
    continue;
  }

  const draft = saveDraft(entry.scenarioId, entry.inputs);
  const weak = getWeakPreviewForDraft(draft.id);
  if (!weak) {
    failures += 1;
    console.log(`FAIL weak-preview-missing scenario=${entry.scenarioId}`);
    continue;
  }

  const preview = runAiRoute({
    scenarioId: entry.scenarioId,
    mode: "preview",
    inputs: draft.inputs
  }).output as Record<string, unknown>;

  const paywall = runAiRoute({
    scenarioId: entry.scenarioId,
    mode: "paywall_summary",
    inputs: draft.inputs
  }).output as Record<string, unknown>;

  const full = runAiRoute({
    scenarioId: entry.scenarioId,
    mode: "full_result",
    inputs: draft.inputs
  }).output as Record<string, unknown>;

  const pdf = runAiRoute({
    scenarioId: entry.scenarioId,
    mode: "pdf",
    inputs: draft.inputs
  }).output as Record<string, unknown>;

  const payment = await runCheckoutPayment({
    scenarioId: entry.scenarioId,
    draftId: draft.id,
    amountRub: scenario.priceRub,
    currency: "RUB",
    description: scenario.paywallTitle
  });

  if (payment.result.status !== "succeeded") {
    failures += 1;
    console.log(`FAIL payment scenario=${entry.scenarioId}`);
    continue;
  }

  const result = createPurchasedResult(draft);
  const reopenByToken = getPurchasedResultByToken(result.token);
  const tokenByCode = findTokenByAccessCode(result.accessCode);

  if (!reopenByToken || tokenByCode !== result.token) {
    failures += 1;
    console.log(`FAIL reopen scenario=${entry.scenarioId}`);
    continue;
  }

  summary.push({
    scenarioId: entry.scenarioId,
    draftId: draft.id,
    preview: {
      key_insight: preview.key_insight,
      main_risk: preview.main_risk
    },
    paywall: {
      product_name: paywall.product_name
    },
    fullResultHeadline:
      (full.main_size as string | undefined) ??
      (full.set_type as string | undefined) ??
      (full.routine_type as string | undefined) ??
      "n/a",
    pdfTitle: pdf.title,
    resultToken: result.token,
    accessCode: result.accessCode
  });

  console.log(`PASS flow scenario=${entry.scenarioId}`);
}

const usageBefore = getPreviewUsage(3);
registerPreviewUse();
registerPreviewUse();
registerPreviewUse();
const usageAfter = getPreviewUsage(3);

if (usageBefore.count !== 0 || canUsePreview(3) !== false || usageAfter.count !== 3) {
  failures += 1;
  console.log("FAIL preview-limit-state");
} else {
  console.log("PASS preview-limit-state");
}

const missingToken = getPurchasedResultByToken("missing-token");
const missingCode = findTokenByAccessCode("ASST-XXXX-YYYY");

if (missingToken !== null || missingCode !== null) {
  failures += 1;
  console.log("FAIL missing-state-handling");
} else {
  console.log("PASS missing-state-handling");
}

console.log(`[qa:flow] summary=${JSON.stringify(summary, null, 2)}`);

if (failures > 0) {
  console.log(`[qa:flow] completed with failures=${failures}`);
  process.exit(1);
}

console.log("[qa:flow] all checks passed");
