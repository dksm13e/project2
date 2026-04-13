import type { ScenarioId } from "@/lib/scenarios";
import { runBeautyFormHints, runBeautyFull, runBeautyPaywall, runBeautyPdf, runBeautyPreview } from "@/lib/ai/beauty";
import { runFashionFormHints, runFashionFull, runFashionPaywall, runFashionPdf, runFashionPreview } from "@/lib/ai/fashion";
import { runGuideEngine } from "@/lib/ai/guide";
import { runHomeFormHints, runHomeFull, runHomePaywall, runHomePdf, runHomePreview } from "@/lib/ai/home";
import { interpretScenarioInputs, type DomainInterpretation } from "@/lib/ai/interpretation";
import {
  AI_OUTPUT_SCHEMAS,
  type AiMode,
  type AiOutputSchemaId,
  type AiOutputUnion,
  type AiScenarioDomain,
  type AiScenarioKey,
  type FormHintsOutput,
  type GuideOutput,
  validateAiOutput
} from "@/lib/ai/outputSchemas";
import { getPromptTemplate, materializePrompt } from "@/lib/ai/prompts";

export type AiRouteRequest = {
  scenarioId: AiScenarioKey;
  mode: AiMode;
  inputs?: Record<string, string>;
  context?: Record<string, string | number | boolean | null | undefined>;
};

export type AiResolvedRoute = {
  scenarioDomain: AiScenarioDomain;
  mode: AiMode;
  promptTemplate: string;
  outputSchema: AiOutputSchemaId;
};

export type AiRouteResult = AiResolvedRoute & {
  prompt: string;
  interpretation: DomainInterpretation;
  output: AiOutputUnion;
};

function mapScenarioToDomain(scenarioId: AiScenarioKey): AiScenarioDomain {
  if (scenarioId === "guide") return "guide";
  if (scenarioId === "fashion-size" || scenarioId === "fashion-fit-check") return "fashion";
  if (scenarioId === "home-room-set") return "home";
  return "beauty";
}

function resolveOutputSchema(domain: AiScenarioDomain, mode: AiMode): AiOutputSchemaId {
  if (domain === "fashion") {
    if (mode === "preview") return AI_OUTPUT_SCHEMAS.fashion.preview;
    if (mode === "paywall_summary") return AI_OUTPUT_SCHEMAS.fashion.paywall_summary;
    if (mode === "full_result") return AI_OUTPUT_SCHEMAS.fashion.full_result;
    if (mode === "pdf") return AI_OUTPUT_SCHEMAS.fashion.pdf;
    if (mode === "form_hint") return AI_OUTPUT_SCHEMAS.fashion.form_hint;
  }

  if (domain === "home") {
    if (mode === "preview") return AI_OUTPUT_SCHEMAS.home.preview;
    if (mode === "paywall_summary") return AI_OUTPUT_SCHEMAS.home.paywall_summary;
    if (mode === "full_result") return AI_OUTPUT_SCHEMAS.home.full_result;
    if (mode === "pdf") return AI_OUTPUT_SCHEMAS.home.pdf;
    if (mode === "form_hint") return AI_OUTPUT_SCHEMAS.home.form_hint;
  }

  if (domain === "beauty") {
    if (mode === "preview") return AI_OUTPUT_SCHEMAS.beauty.preview;
    if (mode === "paywall_summary") return AI_OUTPUT_SCHEMAS.beauty.paywall_summary;
    if (mode === "full_result") return AI_OUTPUT_SCHEMAS.beauty.full_result;
    if (mode === "pdf") return AI_OUTPUT_SCHEMAS.beauty.pdf;
    if (mode === "form_hint") return AI_OUTPUT_SCHEMAS.beauty.form_hint;
  }

  if (domain === "guide" && mode === "guide") {
    return AI_OUTPUT_SCHEMAS.guide.guide;
  }

  throw new Error(`Unsupported AI output schema for domain=${domain} mode=${mode}`);
}

function stringifyContext(context: AiRouteRequest["context"]): Record<string, string> {
  if (!context) return {};

  const stringified: Record<string, string> = {};
  for (const [key, value] of Object.entries(context)) {
    stringified[key] = value == null ? "" : String(value);
  }
  return stringified;
}

function runDomainEngine(
  domain: AiScenarioDomain,
  mode: AiMode,
  inputs: Record<string, string>,
  interpretation: DomainInterpretation
): AiOutputUnion {
  if (domain === "fashion") {
    if (mode === "preview") return runFashionPreview(inputs, interpretation);
    if (mode === "paywall_summary") return runFashionPaywall(inputs, interpretation);
    if (mode === "full_result") return runFashionFull(inputs, interpretation);
    if (mode === "pdf") return runFashionPdf(inputs, interpretation);
    if (mode === "form_hint") return runFashionFormHints();
  }

  if (domain === "home") {
    if (mode === "preview") return runHomePreview(inputs, interpretation);
    if (mode === "paywall_summary") return runHomePaywall(inputs, interpretation);
    if (mode === "full_result") return runHomeFull(inputs, interpretation);
    if (mode === "pdf") return runHomePdf(inputs, interpretation);
    if (mode === "form_hint") return runHomeFormHints();
  }

  if (domain === "beauty") {
    if (mode === "preview") return runBeautyPreview(inputs, interpretation);
    if (mode === "paywall_summary") return runBeautyPaywall(inputs, interpretation);
    if (mode === "full_result") return runBeautyFull(inputs, interpretation);
    if (mode === "pdf") return runBeautyPdf(inputs, interpretation);
    if (mode === "form_hint") return runBeautyFormHints();
  }

  if (domain === "guide" && mode === "guide") {
    return runGuideEngine();
  }

  throw new Error(`Unsupported AI engine call for domain=${domain} mode=${mode}`);
}

export function resolveAiRoute(request: AiRouteRequest): AiResolvedRoute {
  const scenarioDomain = mapScenarioToDomain(request.scenarioId);
  const promptTemplate = getPromptTemplate(scenarioDomain, request.mode);
  const outputSchema = resolveOutputSchema(scenarioDomain, request.mode);

  return {
    scenarioDomain,
    mode: request.mode,
    promptTemplate,
    outputSchema
  };
}

export function runAiRoute(request: AiRouteRequest): AiRouteResult {
  const resolved = resolveAiRoute(request);
  const inputs = request.inputs ?? {};
  const interpretation = interpretScenarioInputs(resolved.scenarioDomain, inputs);
  const prompt = materializePrompt(resolved.promptTemplate, {
    scenario: String(request.scenarioId),
    mode: request.mode,
    inputs: JSON.stringify(inputs),
    interpretation: JSON.stringify(interpretation),
    ...stringifyContext(request.context)
  });

  const output = runDomainEngine(resolved.scenarioDomain, resolved.mode, inputs, interpretation);

  if (!validateAiOutput(resolved.scenarioDomain, resolved.mode, output)) {
    throw new Error(
      `AI output schema mismatch for domain=${resolved.scenarioDomain} mode=${resolved.mode} expected=${resolved.outputSchema}`
    );
  }

  return {
    ...resolved,
    prompt,
    interpretation,
    output
  };
}

export function getAiSmartFieldHint(scenarioId: ScenarioId, fieldName: string): string | null {
  const response = runAiRoute({
    scenarioId,
    mode: "form_hint"
  });

  const output = response.output as FormHintsOutput;
  return output.hints[fieldName] ?? null;
}

export function getAiGuideOutput(): GuideOutput {
  const response = runAiRoute({
    scenarioId: "guide",
    mode: "guide"
  });

  return response.output as GuideOutput;
}
