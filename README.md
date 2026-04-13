# AI Shopping Assistant MVP

Scaffolded Next.js MVP for anonymous recommendation service with weak preview + checkout + token result access.

## Run

```bash
npm install
npm run dev -- -H 0.0.0.0 -p 3002
```

```bash
npm run build
npm run start -- -H 0.0.0.0 -p 3010
```

## QA Commands

```bash
# Technical smoke routes + CSS/JS assets check
npm run qa:smoke

# AI schemas / modes stability check
npm run qa:ai

# Product flow simulation (draft -> preview -> paywall -> payment -> result -> reopen by code)
npm run qa:flow
```

## Troubleshooting: page looks like unstyled HTML

Typical reason: a stale Next.js process is still running with old asset hashes after a rebuild.

How to fix:

1. Stop old `next dev` / `next start` processes.
2. Rebuild and start one fresh process.
3. Run `npm run qa:smoke` and ensure all route assets return `200`.
