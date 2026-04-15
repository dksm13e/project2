import { NextResponse } from "next/server";
import { getAiRuntimeConfig, getResultTtlDays } from "@/lib/ai/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const runtime = getAiRuntimeConfig();
  return NextResponse.json(
    {
      ok: true,
      resultTtlDays: getResultTtlDays(),
      aiMode: runtime.aiMode,
      imageMode: runtime.imageMode,
      textLiveEnabled: runtime.textLiveEnabled,
      imageLiveEnabled: runtime.imageLiveEnabled,
      textModel: runtime.textModel,
      textModelCheap: runtime.textModelCheap,
      textModelFull: runtime.textModelFull
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
