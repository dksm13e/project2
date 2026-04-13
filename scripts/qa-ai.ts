import { getAiGuideOutput, getAiSmartFieldHint, runAiRoute } from "@/lib/ai/router";
import type { AiScenarioKey } from "@/lib/ai/outputSchemas";

type Case = {
  name: string;
  scenarioId: AiScenarioKey;
  inputs: Record<string, string>;
};

type ModeSpec = {
  mode: "preview" | "paywall_summary" | "full_result" | "pdf";
  requiredKeys: string[];
};

const CASES: Case[] = [
  {
    name: "fashion-normal",
    scenarioId: "fashion-size",
    inputs: {
      product_url: "https://example.com/item-hoodie",
      item_type: "hoodie",
      height_cm: "178",
      weight_kg: "72",
      fit_preference: "regular",
      usual_size: "M",
      trusted_brand: "UnknownBrandX"
    }
  },
  {
    name: "fashion-partial",
    scenarioId: "fashion-size",
    inputs: {
      item_type: "hoodie",
      fit_preference: "slim"
    }
  },
  {
    name: "fashion-weird",
    scenarioId: "fashion-size",
    inputs: {
      product_url: "not-a-url ???",
      item_type: "???",
      height_cm: "-100",
      weight_kg: "abc",
      fit_preference: "ultra-loose",
      trusted_brand: "!@#"
    }
  },
  {
    name: "home-normal",
    scenarioId: "home-room-set",
    inputs: {
      room_type: "bedroom",
      style: "minimal",
      budget_rub: "120000",
      room_area: "18",
      existing_items: "bed, lamp",
      reference_url: "https://example.com/chair"
    }
  },
  {
    name: "home-partial",
    scenarioId: "home-room-set",
    inputs: {
      room_type: "living",
      budget_rub: "70000"
    }
  },
  {
    name: "home-weird",
    scenarioId: "home-room-set",
    inputs: {
      room_type: "???",
      style: "",
      budget_rub: "-10",
      room_area: "0",
      existing_items: "??"
    }
  },
  {
    name: "beauty-normal",
    scenarioId: "beauty-routine",
    inputs: {
      skin_type: "combination",
      main_goal: "hydration",
      sensitivity_level: "medium",
      budget_rub: "6000",
      current_routine: "cleanser + cream"
    }
  },
  {
    name: "beauty-partial",
    scenarioId: "beauty-routine",
    inputs: {
      skin_type: "dry"
    }
  },
  {
    name: "beauty-weird",
    scenarioId: "beauty-routine",
    inputs: {
      skin_type: "alien",
      main_goal: "???",
      sensitivity_level: "999",
      budget_rub: "-200"
    }
  }
];

const MODE_SPECS: ModeSpec[] = [
  {
    mode: "preview",
    requiredKeys: ["key_insight", "main_risk", "next_step", "preview_summary"]
  },
  {
    mode: "paywall_summary",
    requiredKeys: ["product_name", "short_summary", "value_bullets", "unlock_outcome"]
  },
  {
    mode: "full_result",
    requiredKeys: ["short_conclusion", "logic_explanation", "important_considerations"]
  },
  {
    mode: "pdf",
    requiredKeys: ["title", "summary", "sections", "recommendations", "notes", "disclaimer"]
  }
];

function hasKeys(value: unknown, keys: string[]) {
  if (!value || typeof value !== "object") return false;
  return keys.every((key) => key in (value as Record<string, unknown>));
}

function compact(value: unknown) {
  return JSON.stringify(value, null, 2).slice(0, 320);
}

let failures = 0;
const snapshots: Array<{ caseName: string; mode: string; sample: string }> = [];

for (const entry of CASES) {
  for (const modeSpec of MODE_SPECS) {
    try {
      const result = runAiRoute({
        scenarioId: entry.scenarioId,
        mode: modeSpec.mode,
        inputs: entry.inputs
      });

      const ok = hasKeys(result.output, modeSpec.requiredKeys);
      if (!ok) {
        failures += 1;
        console.log(`FAIL case=${entry.name} mode=${modeSpec.mode} missing_required_keys`);
      } else {
        console.log(`PASS case=${entry.name} mode=${modeSpec.mode}`);
      }

      snapshots.push({
        caseName: entry.name,
        mode: modeSpec.mode,
        sample: compact(result.output)
      });
    } catch (error) {
      failures += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.log(`FAIL case=${entry.name} mode=${modeSpec.mode} error=${message}`);
    }
  }
}

try {
  const guide = getAiGuideOutput();
  const guideOk =
    typeof guide.welcome_title === "string" &&
    Array.isArray(guide.steps) &&
    guide.steps.length === 3 &&
    guide.steps.every((step) => typeof step.target_id === "string");

  if (!guideOk) {
    failures += 1;
    console.log("FAIL guide-output invalid");
  } else {
    console.log("PASS guide-output");
  }
} catch (error) {
  failures += 1;
  const message = error instanceof Error ? error.message : String(error);
  console.log(`FAIL guide-output error=${message}`);
}

try {
  const hint = getAiSmartFieldHint("fashion-size", "fit_preference");
  const missingHint = getAiSmartFieldHint("fashion-size", "unknown_field_name");
  if (!hint || missingHint !== null) {
    failures += 1;
    console.log("FAIL form-hints retrieval");
  } else {
    console.log("PASS form-hints retrieval");
  }
} catch (error) {
  failures += 1;
  const message = error instanceof Error ? error.message : String(error);
  console.log(`FAIL form-hints error=${message}`);
}

console.log("[qa:ai] output snapshots");
for (const snapshot of snapshots.slice(0, 9)) {
  console.log(`SNAPSHOT case=${snapshot.caseName} mode=${snapshot.mode} sample=${snapshot.sample}`);
}

if (failures > 0) {
  console.log(`[qa:ai] completed with failures=${failures}`);
  process.exit(1);
}

console.log("[qa:ai] all checks passed");
