import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = process.cwd();

function resolveAliasFile(specifier) {
  if (!specifier.startsWith("@/")) return null;

  const withoutAlias = specifier.slice(2);
  const base = path.join(projectRoot, withoutAlias);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.mjs`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
    path.join(base, "index.js"),
    path.join(base, "index.mjs")
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

export async function resolve(specifier, context, defaultResolve) {
  if (specifier === "server-only") {
    return {
      url: pathToFileURL(path.join(projectRoot, "scripts", "server-only-stub.mjs")).href,
      shortCircuit: true
    };
  }

  const resolvedPath = resolveAliasFile(specifier);
  if (resolvedPath) {
    return {
      url: pathToFileURL(resolvedPath).href,
      shortCircuit: true
    };
  }

  return defaultResolve(specifier, context, defaultResolve);
}
