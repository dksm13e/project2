import { getAiGuideOutput, getAiSmartFieldHint, runAiRoute } from "@/lib/ai/router";
import type { AiScenarioKey } from "@/lib/ai/schemas";

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
      product_title: "Unisex heavy hoodie",
      item_category: "худи",
      height_cm: "178",
      weight_kg: "72",
      desired_fit: "regular",
      usual_size: "M",
      brand: "UnknownBrandX",
      material_composition: "80% cotton, 20% polyester",
      fit_priority: "плечи,рукав"
    }
  },
  {
    name: "fashion-partial",
    scenarioId: "fashion-size",
    inputs: {
      product_url: "https://example.com/p/12345",
      desired_fit: "regular"
    }
  },
  {
    name: "fashion-weird",
    scenarioId: "fashion-size",
    inputs: {
      product_url: "not-a-url ???",
      product_title: "model 2024",
      height_cm: "-100",
      weight_kg: "abc",
      desired_fit: "ultra-loose",
      brand: "!@#"
    }
  },
  {
    name: "home-normal",
    scenarioId: "home-room-set",
    inputs: {
      room_type: "bedroom",
      style: "japandi",
      budget_rub: "120000",
      room_area: "18",
      existing_items: "bed, lamp",
      reference_url: "https://example.com/chair",
      room_shape: "square",
      ceiling_height: "standard",
      main_goal: "storage"
    }
  },
  {
    name: "home-partial",
    scenarioId: "home-room-set",
    inputs: {
      room_type: "living",
      budget_rub: "70000",
      main_goal: "cozy"
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
      existing_items: "??",
      main_goal: ""
    }
  },
  {
    name: "beauty-normal",
    scenarioId: "beauty-routine",
    inputs: {
      skin_type: "combination",
      concerns: "dehydration,uneven-tone",
      sensitivity_level: "medium",
      experience_level: "basic",
      desired_steps: "3-4",
      routine_time: "both",
      budget_rub: "6000",
      current_routine: "cleanser + serum + cream + SPF"
    }
  },
  {
    name: "beauty-partial",
    scenarioId: "beauty-routine",
    inputs: {
      skin_type: "dry",
      concerns: "dehydration"
    }
  },
  {
    name: "beauty-weird",
    scenarioId: "beauty-routine",
    inputs: {
      skin_type: "alien",
      concerns: "???",
      sensitivity_level: "999",
      budget_rub: "-200",
      current_routine: "acid retinol acid retinol peel"
    }
  }
];

const MODE_SPECS: ModeSpec[] = [
  {
    mode: "preview",
    requiredKeys: ["key_insight", "main_risk", "next_step", "preview_summary", "confidence", "interpretation_limitations"]
  },
  {
    mode: "paywall_summary",
    requiredKeys: ["product_name", "short_summary", "value_bullets", "unlock_outcome", "confidence_note"]
  },
  {
    mode: "full_result",
    requiredKeys: [
      "summary",
      "confidence_level",
      "confidence_score",
      "primary_recommendation",
      "action_steps",
      "what_to_verify",
      "what_to_avoid",
      "pdf_blocks"
    ]
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
      const result = await runAiRoute({
        scenarioId: entry.scenarioId,
        mode: modeSpec.mode,
        inputs: entry.inputs
      });

      const extraKeys =
        modeSpec.mode === "full_result"
          ? entry.scenarioId === "fashion-size"
            ? ["recognized_category", "main_size", "alt_size", "material_impact"]
            : entry.scenarioId === "home-room-set"
              ? ["set_type", "visual_strategy", "must_have", "later_buy"]
              : ["routine_type", "main_focus", "am_steps", "pm_steps"]
          : [];

      const ok = hasKeys(result.output, [...modeSpec.requiredKeys, ...extraKeys]);
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
  const guide = await getAiGuideOutput();
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
  const hint = await getAiSmartFieldHint("fashion-size", "desired_fit");
  const missingHint = await getAiSmartFieldHint("fashion-size", "unknown_field_name");
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
