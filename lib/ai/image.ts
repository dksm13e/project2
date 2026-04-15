import "server-only";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { getAiRuntimeConfig, requestImageBase64Png } from "@/lib/ai/client";
import {
  getFeatureIllustrationPrompt,
  getOnboardingCharacterPrompt,
  HOME_STYLE_IMAGE_PROMPTS
} from "@/lib/ai/prompts";

type RoomSizeVariant = "small" | "medium" | "large";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const GENERATED_DIR = path.join(PUBLIC_DIR, "generated", "ai");
const PLACEHOLDER_DIR = path.join(GENERATED_DIR, "placeholders");

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sha(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 16);
}

function publicUrlFromAbsolute(filePath: string): string {
  const rel = path.relative(PUBLIC_DIR, filePath).replace(/\\/g, "/");
  return `/${rel}`;
}

async function ensureDir(target: string) {
  await fs.mkdir(target, { recursive: true });
}

async function fileExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

function placeholderSvg(params: { title: string; subtitle: string; accent: string }): string {
  const { title, subtitle, accent } = params;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F7F2EA"/>
      <stop offset="1" stop-color="#EFE6D9"/>
    </linearGradient>
    <linearGradient id="panel" x1="130" y1="120" x2="894" y2="904" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFFFFF" stop-opacity="0.95"/>
      <stop offset="1" stop-color="#F8F2E8" stop-opacity="0.98"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <circle cx="850" cy="180" r="170" fill="${accent}" fill-opacity="0.15"/>
  <circle cx="220" cy="840" r="190" fill="${accent}" fill-opacity="0.10"/>
  <rect x="120" y="120" width="784" height="784" rx="40" fill="url(#panel)" stroke="#D6C8B8" stroke-width="2"/>
  <rect x="176" y="214" width="672" height="420" rx="26" fill="#FBF7F0" stroke="#DDCFBE"/>
  <rect x="206" y="264" width="300" height="16" rx="8" fill="#D4C6B5"/>
  <rect x="206" y="296" width="220" height="12" rx="6" fill="#E3D8CA"/>
  <rect x="206" y="330" width="420" height="12" rx="6" fill="#E7DDCF"/>
  <rect x="206" y="364" width="360" height="12" rx="6" fill="#E7DDCF"/>
  <rect x="560" y="264" width="258" height="258" rx="22" fill="${accent}" fill-opacity="0.18" stroke="${accent}" stroke-opacity="0.45"/>
  <rect x="176" y="666" width="672" height="174" rx="24" fill="#FFFDFC" stroke="#E0D4C5"/>
  <text x="206" y="742" fill="#2D241A" font-family="Segoe UI, Arial, sans-serif" font-size="38" font-weight="600">${title}</text>
  <text x="206" y="786" fill="#665848" font-family="Segoe UI, Arial, sans-serif" font-size="24">${subtitle}</text>
</svg>`;
}

async function getPlaceholderImage(params: {
  key: string;
  title: string;
  subtitle: string;
  accent?: string;
}): Promise<string> {
  await ensureDir(PLACEHOLDER_DIR);
  const fileName = `${normalizeKey(params.key)}.svg`;
  const fullPath = path.join(PLACEHOLDER_DIR, fileName);

  if (!(await fileExists(fullPath))) {
    const svg = placeholderSvg({
      title: params.title,
      subtitle: params.subtitle,
      accent: params.accent ?? "#C89E6B"
    });
    await fs.writeFile(fullPath, svg, "utf8");
  }

  return publicUrlFromAbsolute(fullPath);
}

type GeneratedImageRequest = {
  cacheKey: string;
  prompt: string;
  titleFallback: string;
  subtitleFallback: string;
  transparentBackground?: boolean;
  size?: "1024x1024" | "1536x1024" | "1024x1536";
};

async function getCachedOrGenerateImage(request: GeneratedImageRequest): Promise<string> {
  const runtime = getAiRuntimeConfig();
  await ensureDir(GENERATED_DIR);

  const promptHash = sha(`${request.prompt}|${request.size ?? "1024x1024"}|${request.transparentBackground ? "alpha" : "solid"}`);
  const safeKey = normalizeKey(request.cacheKey);
  const pngPath = path.join(GENERATED_DIR, `${safeKey}-${promptHash}.png`);

  if (await fileExists(pngPath)) {
    return publicUrlFromAbsolute(pngPath);
  }

  if (!runtime.imageLiveEnabled) {
    return getPlaceholderImage({
      key: safeKey,
      title: request.titleFallback,
      subtitle: request.subtitleFallback
    });
  }

  try {
    const b64 = await requestImageBase64Png({
      prompt: request.prompt,
      size: request.size ?? "1024x1024",
      transparentBackground: request.transparentBackground
    });
    await fs.writeFile(pngPath, Buffer.from(b64, "base64"));
    return publicUrlFromAbsolute(pngPath);
  } catch {
    return getPlaceholderImage({
      key: safeKey,
      title: request.titleFallback,
      subtitle: request.subtitleFallback
    });
  }
}

export async function getOnboardingHelperImages(): Promise<{
  welcome: string;
  step1: string;
  step2: string;
  step3: string;
}> {
  const states: Array<"welcome" | "step1" | "step2" | "step3"> = ["welcome", "step1", "step2", "step3"];
  const entries = await Promise.all(
    states.map(async (state) => {
      const prompt = getOnboardingCharacterPrompt(state);
      const url = await getCachedOrGenerateImage({
        cacheKey: `onboarding-helper-${state}`,
        prompt,
        transparentBackground: true,
        titleFallback: "AI Helper",
        subtitleFallback: `Onboarding ${state}`
      });
      return [state, url] as const;
    })
  );

  const map = Object.fromEntries(entries) as Record<(typeof states)[number], string>;
  return {
    welcome: map.welcome,
    step1: map.step1,
    step2: map.step2,
    step3: map.step3
  };
}

export const HOME_STYLE_KEYS = Object.keys(HOME_STYLE_IMAGE_PROMPTS);

export async function getHomeStylePreviewImage(styleKey: string, roomSize: RoomSizeVariant): Promise<string> {
  const stylePrompt = HOME_STYLE_IMAGE_PROMPTS[styleKey] ?? HOME_STYLE_IMAGE_PROMPTS.minimalism;
  const roomSizePrompt =
    roomSize === "small"
      ? "small room, compact scale, efficient zoning"
      : roomSize === "large"
        ? "large room, layered composition, spacious layout"
        : "medium room, balanced scale and circulation";

  return getCachedOrGenerateImage({
    cacheKey: `home-style-${styleKey}-${roomSize}`,
    prompt: `${stylePrompt}. ${roomSizePrompt}. Premium minimal interior render, realistic mood, warm neutral light, no text.`,
    titleFallback: styleKey,
    subtitleFallback: `${roomSize} room`
  });
}

export async function getFeatureIllustration(kind: string): Promise<string> {
  return getCachedOrGenerateImage({
    cacheKey: `feature-${kind}`,
    prompt: `${getFeatureIllustrationPrompt(kind)}. Premium minimal style. No text.`,
    titleFallback: "AI Shopping",
    subtitleFallback: kind
  });
}
