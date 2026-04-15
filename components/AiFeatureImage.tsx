"use client";

import { useEffect, useState } from "react";
import { fetchFeatureImage } from "@/lib/ai/http";

type Props = {
  featureKind: string;
  alt: string;
  className?: string;
};

export function AiFeatureImage({ featureKind, alt, className }: Props) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    fetchFeatureImage(featureKind)
      .then((url) => {
        if (!isMounted) return;
        setSrc(url);
      })
      .catch(() => {
        if (!isMounted) return;
        setSrc("");
      });

    return () => {
      isMounted = false;
    };
  }, [featureKind]);

  if (!src) {
    return <div className={`${className ?? ""} animate-pulse rounded-2xl border border-[#ddcfbe] bg-[#f8f3ea]`} aria-hidden="true" />;
  }

  return <img src={src} alt={alt} className={className} loading="lazy" />;
}
