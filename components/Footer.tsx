import Link from "next/link";
import { beautyDisclaimer, legalDisclaimer } from "@/lib/content";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-black/10 bg-white">
      <div className="container-shell space-y-4 py-8 text-sm text-black/70">
        <p>{legalDisclaimer}</p>
        <p>{beautyDisclaimer}</p>
        <div className="flex flex-wrap gap-4 text-xs">
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/disclaimer">Disclaimer</Link>
          <Link href="/legal/cookies">Cookies</Link>
          <Link href="/open-by-code">Открыть по коду</Link>
        </div>
      </div>
    </footer>
  );
}
