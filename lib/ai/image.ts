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

type HomeStylePalette = {
  bgStart: string;
  bgEnd: string;
  wall: string;
  floor: string;
  accentA: string;
  accentB: string;
};

const HOME_STYLE_PLACEHOLDER_PALETTES: Record<string, HomeStylePalette> = {
  minimalism: { bgStart: "#f1eee9", bgEnd: "#e7e2da", wall: "#f8f6f2", floor: "#e4ddd2", accentA: "#b7ac9b", accentB: "#cbc2b5" },
  "warm-minimal": { bgStart: "#f4eadf", bgEnd: "#e9ddcf", wall: "#faf6ef", floor: "#e8d9c8", accentA: "#be9f82", accentB: "#d6bca3" },
  scandi: { bgStart: "#ecefe9", bgEnd: "#dde3dc", wall: "#f9fbf8", floor: "#dfe5dc", accentA: "#9ea99b", accentB: "#c2cabc" },
  japandi: { bgStart: "#efe7dd", bgEnd: "#e2d7c8", wall: "#f8f3ea", floor: "#ddd1bf", accentA: "#a88f72", accentB: "#c1ab92" },
  "modern-clean": { bgStart: "#ebeeef", bgEnd: "#dde2e4", wall: "#f7f9fa", floor: "#d8dde0", accentA: "#9ba5ab", accentB: "#c2c9cd" },
  "soft-loft": { bgStart: "#e6e1de", bgEnd: "#d7d0cc", wall: "#f3f0ed", floor: "#ccc5bf", accentA: "#8f857e", accentB: "#b0a59d" },
  "modern-organic": { bgStart: "#ece6df", bgEnd: "#ddd5cb", wall: "#f7f2ea", floor: "#d5ccbf", accentA: "#9b8b75", accentB: "#c4b29d" },
  "quiet-luxury-light": { bgStart: "#f0e7dc", bgEnd: "#e3d6c7", wall: "#fbf6ee", floor: "#dfcfbc", accentA: "#a4896f", accentB: "#cab096" },
  "natural-neutral": { bgStart: "#eee8df", bgEnd: "#ded5ca", wall: "#f8f3ec", floor: "#d7ccbf", accentA: "#9d8f7d", accentB: "#c2b39f" },
  "cozy-basic": { bgStart: "#f2e9de", bgEnd: "#e3d6c6", wall: "#fbf4e9", floor: "#dccdb9", accentA: "#aa8f72", accentB: "#c9af92" },
  "storage-first": { bgStart: "#ebe8e3", bgEnd: "#dbd6cf", wall: "#f6f4f0", floor: "#d3ccc2", accentA: "#8f8a80", accentB: "#b1aa9e" },
  "compact-studio": { bgStart: "#ece5dc", bgEnd: "#ded4c7", wall: "#f8f3ea", floor: "#d7ccbe", accentA: "#9a866f", accentB: "#bfaa92" },
  "hotel-like-calm": { bgStart: "#efe6dd", bgEnd: "#dfd2c2", wall: "#f9f4eb", floor: "#d9cbb9", accentA: "#9c7f64", accentB: "#c0a489" },
  "soft-feminine": { bgStart: "#f2e7e6", bgEnd: "#e4d7d5", wall: "#fcf7f6", floor: "#dccfcd", accentA: "#b48f89", accentB: "#cfb3ad" },
  "masculine-clean": { bgStart: "#e3e3e3", bgEnd: "#d2d2d2", wall: "#f2f2f2", floor: "#c8c8c8", accentA: "#6f7274", accentB: "#9fa2a4" },
  "family-practical": { bgStart: "#ece8df", bgEnd: "#ddd5c9", wall: "#f8f5ee", floor: "#d7cdbf", accentA: "#9b8b75", accentB: "#baa78f" },
  "rental-light": { bgStart: "#efebe4", bgEnd: "#e0d9ce", wall: "#faf7f2", floor: "#dbd2c5", accentA: "#a3927a", accentB: "#c4b39a" },
  "workspace-functional": { bgStart: "#e8e9e7", bgEnd: "#d7dbd8", wall: "#f4f6f4", floor: "#cfd4d1", accentA: "#788279", accentB: "#a0a79f" },
  "dark-accent-modern": { bgStart: "#e2dfdc", bgEnd: "#d0cbc7", wall: "#efebe7", floor: "#c5bfba", accentA: "#5f5650", accentB: "#8b7f76" },
  "light-premium-simple": { bgStart: "#f3ece2", bgEnd: "#e6dbc9", wall: "#fcf8f0", floor: "#dfd1bd", accentA: "#ad9376", accentB: "#cdb69e" }
};

function getReadableStyleName(styleKey: string): string {
  const map: Record<string, string> = {
    minimalism: "Минимализм",
    "warm-minimal": "Теплый минимализм",
    scandi: "Сканди",
    japandi: "Japandi",
    "modern-clean": "Современный clean",
    "soft-loft": "Soft loft",
    "modern-organic": "Modern organic",
    "quiet-luxury-light": "Quiet luxury light",
    "natural-neutral": "Natural neutral",
    "cozy-basic": "Уютный базовый",
    "storage-first": "Storage-first",
    "compact-studio": "Compact studio",
    "hotel-like-calm": "Hotel-like calm",
    "soft-feminine": "Женственный soft",
    "masculine-clean": "Masculine clean",
    "family-practical": "Семейный practical",
    "rental-light": "Аренда без перегруза",
    "workspace-functional": "Workspace functional",
    "dark-accent-modern": "Dark accent modern",
    "light-premium-simple": "Light premium simple"
  };

  return map[styleKey] ?? styleKey;
}

function parseHomeStyleCacheKey(key: string): { styleKey: string; roomSize: RoomSizeVariant } | null {
  const match = key.match(/^home-style-(.+)-(small|medium|large)$/);
  if (!match) return null;
  return {
    styleKey: match[1],
    roomSize: match[2] as RoomSizeVariant
  };
}

function homeStylePlaceholderSvg(styleKey: string, roomSize: RoomSizeVariant): string {
  const palette = HOME_STYLE_PLACEHOLDER_PALETTES[styleKey] ?? HOME_STYLE_PLACEHOLDER_PALETTES.minimalism;
  const roomLabel = roomSize === "small" ? "Компактная" : roomSize === "large" ? "Большая" : "Средняя";
  const sofaWidth = roomSize === "small" ? 235 : roomSize === "large" ? 335 : 285;
  const rugWidth = roomSize === "small" ? 290 : roomSize === "large" ? 440 : 370;
  const shelfHeight = roomSize === "small" ? 148 : roomSize === "large" ? 212 : 178;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1536" height="1024" viewBox="0 0 1536 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1536" y2="1024" gradientUnits="userSpaceOnUse">
      <stop stop-color="${palette.bgStart}"/>
      <stop offset="1" stop-color="${palette.bgEnd}"/>
    </linearGradient>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="660" gradientUnits="userSpaceOnUse">
      <stop stop-color="${palette.wall}"/>
      <stop offset="1" stop-color="${palette.bgStart}"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="1024" x2="1536" y2="610" gradientUnits="userSpaceOnUse">
      <stop stop-color="${palette.floor}"/>
      <stop offset="1" stop-color="${palette.bgEnd}"/>
    </linearGradient>
  </defs>
  <rect width="1536" height="1024" fill="url(#bg)"/>
  <rect x="0" y="0" width="1536" height="670" fill="url(#wall)"/>
  <path d="M0 600H1536V1024H0V600Z" fill="url(#floor)"/>
  <circle cx="1260" cy="170" r="170" fill="${palette.accentB}" fill-opacity="0.24"/>
  <circle cx="300" cy="850" r="230" fill="${palette.accentA}" fill-opacity="0.15"/>

  <rect x="220" y="430" width="${sofaWidth}" height="145" rx="24" fill="${palette.accentA}" fill-opacity="0.34"/>
  <rect x="250" y="390" width="${Math.round(sofaWidth * 0.78)}" height="72" rx="18" fill="${palette.accentA}" fill-opacity="0.42"/>
  <rect x="625" y="500" width="190" height="${shelfHeight}" rx="16" fill="${palette.accentB}" fill-opacity="0.38"/>
  <rect x="848" y="480" width="170" height="${Math.round(shelfHeight * 0.9)}" rx="16" fill="${palette.accentA}" fill-opacity="0.28"/>
  <ellipse cx="682" cy="760" rx="${Math.round(rugWidth / 2)}" ry="82" fill="${palette.accentB}" fill-opacity="0.31"/>
  <rect x="1038" y="370" width="210" height="302" rx="22" fill="${palette.accentA}" fill-opacity="0.2"/>
  <rect x="1066" y="404" width="154" height="240" rx="14" fill="${palette.wall}" fill-opacity="0.75"/>

  <rect x="92" y="84" width="532" height="116" rx="18" fill="white" fill-opacity="0.82"/>
  <text x="132" y="143" fill="#2F261D" font-family="Segoe UI, Arial, sans-serif" font-size="42" font-weight="600">${getReadableStyleName(styleKey)}</text>
  <text x="132" y="182" fill="#6B5B4C" font-family="Segoe UI, Arial, sans-serif" font-size="24">${roomLabel} комната</text>
</svg>`;
}

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
    const parsedHomeStyle = parseHomeStyleCacheKey(params.key);
    const svg = parsedHomeStyle
      ? homeStylePlaceholderSvg(parsedHomeStyle.styleKey, parsedHomeStyle.roomSize)
      : placeholderSvg({
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
