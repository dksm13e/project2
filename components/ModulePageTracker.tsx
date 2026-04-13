"use client";

import { useEffect } from "react";
import { ANALYTICS_EVENT_NAMES, trackEvent } from "@/lib/analytics";

type Props = {
  module: "fashion" | "home" | "beauty";
  page: "module" | "scenario";
  scenarioId?: string;
};

export function ModulePageTracker({ module, page, scenarioId }: Props) {
  useEffect(() => {
    trackEvent(ANALYTICS_EVENT_NAMES.openModulePage, {
      module,
      page,
      scenario_id: scenarioId ?? null
    });
  }, [module, page, scenarioId]);

  return null;
}