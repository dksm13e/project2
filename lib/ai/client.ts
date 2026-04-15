import "server-only";

export type AiModeRuntime = "mock" | "live";

type AiTaskClass =
  | "interpretation"
  | "preview"
  | "paywall_summary"
  | "full_result"
  | "pdf"
  | "guide"
  | "form_hint"
  | "default";

type AiTextModelRouting = {
  defaultModel: string;
  cheapModel: string;
  fullModel: string;
  interpretation: string;
  preview: string;
  paywall_summary: string;
  full_result: string;
  pdf: string;
  guide: string;
  form_hint: string;
};

export type AiRuntimeConfig = {
  apiKey: string;
  textModel: string;
  textModelCheap: string;
  textModelFull: string;
  textModelRouting: AiTextModelRouting;
  aiMode: AiModeRuntime;
  imageMode: AiModeRuntime;
  enableImageGen: boolean;
  hasApiKey: boolean;
  textLiveEnabled: boolean;
  imageLiveEnabled: boolean;
};

function parseMode(value: string | undefined): AiModeRuntime {
  return value?.toLowerCase() === "live" ? "live" : "mock";
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value == null) return fallback;
  const raw = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(raw)) return true;
  if (["0", "false", "no", "off"].includes(raw)) return false;
  return fallback;
}

function taskClassFromName(task: string): AiTaskClass {
  const value = task.trim().toLowerCase();
  if (!value) return "default";
  if (value.includes("interpretation")) return "interpretation";
  if (value.includes("paywall_summary")) return "paywall_summary";
  if (value.includes("full_result")) return "full_result";
  if (value.endsWith(".pdf") || value.includes("pdf")) return "pdf";
  if (value.includes("form_hint")) return "form_hint";
  if (value.includes("guide")) return "guide";
  if (value.includes("preview")) return "preview";
  return "default";
}

function buildTextModelRouting(defaultModel: string): AiTextModelRouting {
  const cheapModel = process.env.OPENAI_TEXT_MODEL_CHEAP?.trim() || "gpt-4.1-mini";
  const fullModel = process.env.OPENAI_TEXT_MODEL_FULL?.trim() || defaultModel;

  return {
    defaultModel,
    cheapModel,
    fullModel,
    interpretation: process.env.OPENAI_TEXT_MODEL_INTERPRETATION?.trim() || cheapModel,
    preview: process.env.OPENAI_TEXT_MODEL_PREVIEW?.trim() || cheapModel,
    paywall_summary: process.env.OPENAI_TEXT_MODEL_PAYWALL?.trim() || cheapModel,
    full_result: process.env.OPENAI_TEXT_MODEL_FULL_RESULT?.trim() || fullModel,
    pdf: process.env.OPENAI_TEXT_MODEL_PDF?.trim() || fullModel,
    guide: process.env.OPENAI_TEXT_MODEL_GUIDE?.trim() || cheapModel,
    form_hint: process.env.OPENAI_TEXT_MODEL_FORM_HINT?.trim() || cheapModel
  };
}

function resolveTextModelForTask(task: string, routing: AiTextModelRouting): string {
  const taskClass = taskClassFromName(task);
  if (taskClass === "interpretation") return routing.interpretation;
  if (taskClass === "preview") return routing.preview;
  if (taskClass === "paywall_summary") return routing.paywall_summary;
  if (taskClass === "full_result") return routing.full_result;
  if (taskClass === "pdf") return routing.pdf;
  if (taskClass === "guide") return routing.guide;
  if (taskClass === "form_hint") return routing.form_hint;
  return routing.defaultModel;
}

function defaultMaxTokensForTask(task: string): number {
  const taskClass = taskClassFromName(task);
  if (taskClass === "interpretation") return 260;
  if (taskClass === "preview") return 220;
  if (taskClass === "paywall_summary") return 260;
  if (taskClass === "full_result") return 900;
  if (taskClass === "guide") return 260;
  if (taskClass === "form_hint") return 420;
  if (taskClass === "pdf") return 700;
  return 700;
}

export function getAiRuntimeConfig(): AiRuntimeConfig {
  const apiKey = process.env.OPENAI_API_KEY?.trim() ?? "";
  const textModel = process.env.OPENAI_TEXT_MODEL?.trim() || "gpt-5";
  const textModelRouting = buildTextModelRouting(textModel);
  const aiMode = parseMode(process.env.OPENAI_AI_MODE);
  const imageMode = parseMode(process.env.OPENAI_IMAGE_MODE);
  const enableImageGen = parseBoolean(process.env.OPENAI_ENABLE_IMAGE_GEN, false);
  const hasApiKey = apiKey.length > 0;

  return {
    apiKey,
    textModel,
    textModelCheap: textModelRouting.cheapModel,
    textModelFull: textModelRouting.fullModel,
    textModelRouting,
    aiMode,
    imageMode,
    enableImageGen,
    hasApiKey,
    textLiveEnabled: aiMode === "live" && hasApiKey,
    imageLiveEnabled: imageMode === "live" && enableImageGen && hasApiKey
  };
}

export function getResultTtlDays(): number {
  const raw = Number(process.env.RESULT_TTL_DAYS ?? "14");
  if (!Number.isFinite(raw)) return 14;
  return Math.max(1, Math.min(365, Math.round(raw)));
}

function extractResponseText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const typed = payload as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };

  if (typeof typed.output_text === "string" && typed.output_text.trim().length > 0) {
    return typed.output_text;
  }

  if (!Array.isArray(typed.output)) return "";
  const chunks: string[] = [];

  for (const item of typed.output) {
    const content = item?.content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (part?.type === "output_text" && typeof part.text === "string") {
        chunks.push(part.text);
      }
    }
  }

  return chunks.join("\n").trim();
}

function parseJsonBlock(raw: string): unknown {
  const direct = raw.trim();
  if (!direct) throw new Error("Empty model response");

  try {
    return JSON.parse(direct);
  } catch {
    const fenced = direct.match(/```json\s*([\s\S]*?)```/i)?.[1] ?? direct.match(/```([\s\S]*?)```/)?.[1];
    if (fenced) {
      return JSON.parse(fenced.trim());
    }

    const start = direct.indexOf("{");
    const end = direct.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(direct.slice(start, end + 1));
    }

    throw new Error("Model did not return JSON");
  }
}

export type OpenAiStructuredRequest = {
  task: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  inputImages?: Array<{
    field?: string;
    image_url: string;
    detail?: "low" | "high" | "auto";
  }>;
};

export async function requestStructuredJson<T>(request: OpenAiStructuredRequest): Promise<T> {
  const runtime = getAiRuntimeConfig();
  if (!runtime.textLiveEnabled) {
    throw new Error("Live AI mode is disabled");
  }

  const model = resolveTextModelForTask(request.task, runtime.textModelRouting);

  const userContent: Array<
    | { type: "input_text"; text: string }
    | { type: "input_image"; image_url: string; detail?: "low" | "high" | "auto" }
  > = [{ type: "input_text", text: request.userPrompt }];

  const validImages =
    request.inputImages?.filter((item) => {
      if (!item?.image_url) return false;
      return /^data:image\/[a-z0-9.+-]+;base64,/i.test(item.image_url) || /^https?:\/\//i.test(item.image_url);
    }) ?? [];

  if (validImages.length > 0) {
    const imageInfo = validImages.map((item, index) => `${index + 1}. ${item.field ?? `image_${index + 1}`}`).join("\n");
    userContent.push({
      type: "input_text",
      text: `Attached visual context:\n${imageInfo}`
    });

    for (const image of validImages.slice(0, 4)) {
      userContent.push({
        type: "input_image",
        image_url: image.image_url,
        detail: image.detail ?? "auto"
      });
    }
  }

  const supportsTemperature = !/^gpt-5(\b|[-.])/i.test(model);
  const requestBody: Record<string, unknown> = {
    model,
    max_output_tokens: request.maxOutputTokens ?? defaultMaxTokensForTask(request.task),
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: request.systemPrompt }]
      },
      {
        role: "user",
        content: userContent
      }
    ]
  };

  if (supportsTemperature && request.temperature != null) {
    requestBody.temperature = request.temperature;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${runtime.apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed (${request.task}) status=${response.status} body=${body.slice(0, 500)}`);
  }

  const payload = (await response.json()) as unknown;
  const text = extractResponseText(payload);
  const parsed = parseJsonBlock(text) as T;
  return parsed;
}

export async function requestImageBase64Png(params: {
  prompt: string;
  size?: "1024x1024" | "1536x1024" | "1024x1536";
  transparentBackground?: boolean;
}): Promise<string> {
  const runtime = getAiRuntimeConfig();
  if (!runtime.imageLiveEnabled) {
    throw new Error("Live image mode is disabled");
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${runtime.apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: params.prompt,
      size: params.size ?? "1024x1024",
      output_format: "png",
      ...(params.transparentBackground ? { background: "transparent" } : {})
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI image request failed status=${response.status} body=${body.slice(0, 500)}`);
  }

  const payload = (await response.json()) as { data?: Array<{ b64_json?: string }> };
  const b64 = payload.data?.[0]?.b64_json;
  if (!b64) throw new Error("Image response does not contain b64_json");
  return b64;
}
