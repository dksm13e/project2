import type { ScenarioId } from "@/lib/scenarios";
import {
  generateBeautyFullResult,
  generateBeautyPaywallSummary,
  generateBeautyPdfPayload,
  generateBeautyPreview,
  interpretBeautyInput,
  runBeautyFormHints
} from "@/lib/ai/beauty";
import {
  generateFashionFullResult,
  generateFashionPaywallSummary,
  generateFashionPdfPayload,
  generateFashionPreview,
  interpretFashionInput,
  runFashionFormHints
} from "@/lib/ai/fashion";
import { generateGuideOutput } from "@/lib/ai/guide";
import {
  generateHomeFullResult,
  generateHomePaywallSummary,
  generateHomePdfPayload,
  generateHomePreview,
  interpretHomeInput,
  runHomeFormHints
} from "@/lib/ai/home";
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
} from "@/lib/ai/schemas";
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

async function resolveInterpretation(
  domain: AiScenarioDomain,
  inputs: Record<string, string>
): Promise<DomainInterpretation> {
  if (domain === "fashion") return await interpretFashionInput(inputs);
  if (domain === "home") return await interpretHomeInput(inputs);
  if (domain === "beauty") return await interpretBeautyInput(inputs);
  return interpretScenarioInputs("guide", inputs);
}

async function runDomainEngine(
  domain: AiScenarioDomain,
  mode: AiMode,
  inputs: Record<string, string>,
  interpretation: DomainInterpretation
): Promise<AiOutputUnion> {
  if (domain === "fashion") {
    if (mode === "preview") return await generateFashionPreview(inputs, interpretation as Extract<DomainInterpretation, { domain: "fashion" }>);
    if (mode === "paywall_summary") return await generateFashionPaywallSummary(inputs, interpretation as Extract<DomainInterpretation, { domain: "fashion" }>);
    if (mode === "full_result") return await generateFashionFullResult(inputs, interpretation as Extract<DomainInterpretation, { domain: "fashion" }>);
    if (mode === "pdf") return await generateFashionPdfPayload(inputs, interpretation as Extract<DomainInterpretation, { domain: "fashion" }>);
    if (mode === "form_hint") return runFashionFormHints();
  }

  if (domain === "home") {
    if (mode === "preview") return await generateHomePreview(inputs, interpretation as Extract<DomainInterpretation, { domain: "home" }>);
    if (mode === "paywall_summary") return await generateHomePaywallSummary(inputs, interpretation as Extract<DomainInterpretation, { domain: "home" }>);
    if (mode === "full_result") return await generateHomeFullResult(inputs, interpretation as Extract<DomainInterpretation, { domain: "home" }>);
    if (mode === "pdf") return await generateHomePdfPayload(inputs, interpretation as Extract<DomainInterpretation, { domain: "home" }>);
    if (mode === "form_hint") return runHomeFormHints();
  }

  if (domain === "beauty") {
    if (mode === "preview") return await generateBeautyPreview(inputs, interpretation as Extract<DomainInterpretation, { domain: "beauty" }>);
    if (mode === "paywall_summary") return await generateBeautyPaywallSummary(inputs, interpretation as Extract<DomainInterpretation, { domain: "beauty" }>);
    if (mode === "full_result") return await generateBeautyFullResult(inputs, interpretation as Extract<DomainInterpretation, { domain: "beauty" }>);
    if (mode === "pdf") return await generateBeautyPdfPayload(inputs, interpretation as Extract<DomainInterpretation, { domain: "beauty" }>);
    if (mode === "form_hint") return runBeautyFormHints();
  }

  if (domain === "guide" && mode === "guide") {
    return await generateGuideOutput();
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

export async function runAiRoute(request: AiRouteRequest): Promise<AiRouteResult> {
  const resolved = resolveAiRoute(request);
  const inputs = request.inputs ?? {};
  const interpretation = await resolveInterpretation(resolved.scenarioDomain, inputs);
  const prompt = materializePrompt(resolved.promptTemplate, {
    scenario: String(request.scenarioId),
    mode: request.mode,
    inputs: JSON.stringify(inputs),
    interpretation: JSON.stringify(interpretation),
    ...stringifyContext(request.context)
  });

  const output = await runDomainEngine(resolved.scenarioDomain, resolved.mode, inputs, interpretation);

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

export async function getAiSmartFieldHints(scenarioId: ScenarioId): Promise<FormHintsOutput> {
  const response = await runAiRoute({
    scenarioId,
    mode: "form_hint"
  });

  return response.output as FormHintsOutput;
}

export async function getAiSmartFieldHint(scenarioId: ScenarioId, fieldName: string): Promise<string | null> {
  const output = await getAiSmartFieldHints(scenarioId);
  return output.hints[fieldName] ?? null;
}

export async function getAiGuideOutput(): Promise<GuideOutput> {
  const response = await runAiRoute({
    scenarioId: "guide",
    mode: "guide"
  });

  return response.output as GuideOutput;
}
