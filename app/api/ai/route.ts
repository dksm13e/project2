import { NextResponse } from "next/server";
import { runAiRoute, type AiRouteRequest } from "@/lib/ai/router";

export const dynamic = "force-dynamic";

function isStringRecord(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== "object") return false;
  return Object.values(value).every((item) => typeof item === "string");
}

function isContextRecord(
  value: unknown
): value is Record<string, string | number | boolean | null | undefined> {
  if (!value || typeof value !== "object") return false;
  return Object.values(value).every(
    (item) =>
      item == null || typeof item === "string" || typeof item === "number" || typeof item === "boolean"
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AiRouteRequest>;

    if (typeof body?.scenarioId !== "string" || typeof body?.mode !== "string") {
      return NextResponse.json(
        { ok: false, error: "Invalid payload: scenarioId and mode are required strings." },
        { status: 400 }
      );
    }

    const payload: AiRouteRequest = {
      scenarioId: body.scenarioId as AiRouteRequest["scenarioId"],
      mode: body.mode as AiRouteRequest["mode"],
      inputs: isStringRecord(body.inputs) ? body.inputs : {},
      context: isContextRecord(body.context) ? body.context : undefined
    };

    const result = await runAiRoute(payload);
    return NextResponse.json(
      { ok: true, result },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown AI route error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
