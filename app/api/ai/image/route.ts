import { NextResponse } from "next/server";
import {
  getFeatureIllustration,
  getHomeStylePreviewImage,
  getOnboardingHelperImages
} from "@/lib/ai/image";

export const dynamic = "force-dynamic";

type RoomSizeVariant = "small" | "medium" | "large";

function parseRoomSize(value: string | null): RoomSizeVariant {
  if (value === "small" || value === "large") return value;
  return "medium";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");

  try {
    if (kind === "onboarding-helper-set") {
      const images = await getOnboardingHelperImages();
      return NextResponse.json({ ok: true, images });
    }

    if (kind === "onboarding-helper") {
      const state = (searchParams.get("state") ?? "welcome") as "welcome" | "step1" | "step2" | "step3";
      const images = await getOnboardingHelperImages();
      const url = images[state] ?? images.welcome;
      return NextResponse.json({ ok: true, url });
    }

    if (kind === "home-style") {
      const styleKey = searchParams.get("styleKey");
      if (!styleKey) {
        return NextResponse.json({ ok: false, error: "Missing styleKey query parameter." }, { status: 400 });
      }

      const roomSize = parseRoomSize(searchParams.get("roomSize"));
      const url = await getHomeStylePreviewImage(styleKey, roomSize);
      return NextResponse.json({ ok: true, url });
    }

    if (kind === "feature") {
      const featureKind = searchParams.get("featureKind") ?? "result-empty";
      const url = await getFeatureIllustration(featureKind);
      return NextResponse.json({ ok: true, url });
    }

    return NextResponse.json({ ok: false, error: "Unknown image kind." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown image route error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
