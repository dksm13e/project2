"use client";

export const ANALYTICS_EVENT_NAMES = {
  heroCtaClick: "click_hero_cta",
  openModulePage: "open_module_page",
  formStarted: "form_started",
  formCompleted: "form_completed",
  weakPreviewShown: "weak_preview_shown",
  clickUnlockFullResult: "click_unlock_full_result",
  paywallShown: "paywall_shown",
  clickProceedToPayment: "click_proceed_to_payment",
  paymentSuccess: "payment_success",
  resultShown: "result_shown",
  pdfDownloaded: "pdf_downloaded",
  accessCodeCopied: "access_code_copied",
  reopenByCodeSuccess: "reopen_by_code_success",
  reopenByCodeFail: "reopen_by_code_fail"
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[keyof typeof ANALYTICS_EVENT_NAMES];

export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

export type AnalyticsRecord = {
  event: AnalyticsEventName;
  path: string;
  ts: string;
  payload: AnalyticsPayload;
};

const STORAGE_KEY = "assistant_analytics_events_v1";
const MAX_STORED_EVENTS = 500;

function readStoredEvents(): AnalyticsRecord[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as AnalyticsRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredEvents(events: AnalyticsRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_STORED_EVENTS)));
}

function sanitizePayload(payload: AnalyticsPayload): AnalyticsPayload {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

function pushToDataLayer(record: AnalyticsRecord) {
  if (typeof window === "undefined") return;

  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) {
    dataLayer.push(record);
  }
}

function pushToGtag(record: AnalyticsRecord) {
  if (typeof window === "undefined") return;

  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    gtag("event", record.event, {
      page_path: record.path,
      ...record.payload
    });
  }
}

export function trackEvent(event: AnalyticsEventName, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;

  const record: AnalyticsRecord = {
    event,
    path: window.location.pathname,
    ts: new Date().toISOString(),
    payload: sanitizePayload(payload)
  };

  const existing = readStoredEvents();
  existing.push(record);
  writeStoredEvents(existing);

  pushToDataLayer(record);
  pushToGtag(record);

  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", record.event, record.payload);
  }
}

export function getTrackedEvents(): AnalyticsRecord[] {
  return readStoredEvents();
}