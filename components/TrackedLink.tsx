"use client";

import Link from "next/link";
import type { LinkProps } from "next/link";
import type { ReactNode } from "react";
import { trackEvent, type AnalyticsEventName, type AnalyticsPayload } from "@/lib/analytics";

type Props = LinkProps & {
  id?: string;
  className?: string;
  children: ReactNode;
  eventName: AnalyticsEventName;
  eventPayload?: AnalyticsPayload;
  onTrackedClick?: () => void;
};

export function TrackedLink({
  id,
  className,
  children,
  eventName,
  eventPayload,
  onTrackedClick,
  ...linkProps
}: Props) {
  const onClick = () => {
    trackEvent(eventName, eventPayload);
    onTrackedClick?.();
  };

  return (
    <Link {...linkProps} id={id} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
