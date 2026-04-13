import process from "node:process";

const baseUrl = (process.env.QA_BASE_URL ?? "http://127.0.0.1:3010").replace(/\/+$/, "");

const routeChecks = [
  { route: "/", expectedStatus: 200 },
  { route: "/fashion", expectedStatus: 200 },
  { route: "/fashion/size", expectedStatus: 200 },
  { route: "/fashion/fit-check", expectedStatus: 200 },
  { route: "/home", expectedStatus: 200 },
  { route: "/home/room-set", expectedStatus: 200 },
  { route: "/beauty", expectedStatus: 200 },
  { route: "/beauty/routine", expectedStatus: 200 },
  { route: "/pricing", expectedStatus: 200 },
  { route: "/faq", expectedStatus: 200 },
  { route: "/how-it-works", expectedStatus: 200 },
  { route: "/open-by-code", expectedStatus: 200 },
  { route: "/legal/privacy", expectedStatus: 200 },
  { route: "/legal/terms", expectedStatus: 200 },
  { route: "/legal/disclaimer", expectedStatus: 200 },
  { route: "/legal/cookies", expectedStatus: 200 },
  { route: "/preview/fashion-size", expectedStatus: 200 },
  { route: "/preview/home-room-set", expectedStatus: 200 },
  { route: "/preview/beauty-routine", expectedStatus: 200 },
  { route: "/checkout", expectedStatus: 200 },
  { route: "/checkout?scenario=fashion-size&draft=missing", expectedStatus: 200 },
  { route: "/result/demo-token", expectedStatus: 200 },
  { route: "/result/missing-token", expectedStatus: 200 },
  { route: "/unknown-route-qa", expectedStatus: 404 }
];

function collectAssets(html) {
  const assets = new Set();

  const cssMatches = html.match(/href="(\/_next\/static\/css\/[^"]+\.css)"/g) ?? [];
  const jsMatches = html.match(/src="(\/_next\/static\/chunks\/[^"]+\.js)"/g) ?? [];

  for (const token of [...cssMatches, ...jsMatches]) {
    const value = token.match(/"(\/_next\/static\/[^"]+)"/)?.[1];
    if (value) assets.add(value);
  }

  return [...assets];
}

async function fetchText(url) {
  const response = await fetch(url);
  const body = await response.text();
  return { response, body };
}

let failures = 0;
const allAssets = new Set();
const assetFailures = [];

console.log(`[qa:smoke] baseUrl=${baseUrl}`);

for (const check of routeChecks) {
  const url = `${baseUrl}${check.route}`;
  const { response, body } = await fetchText(url);
  const okStatus = response.status === check.expectedStatus;

  if (!okStatus) {
    failures += 1;
    console.log(`FAIL route=${check.route} expected=${check.expectedStatus} actual=${response.status}`);
    continue;
  }

  if (check.expectedStatus === 200) {
    const hasCssLink = /\/_next\/static\/css\/.+\.css/.test(body);
    const hasHeader = /<header/.test(body);
    const hasFooter = /<footer/.test(body);

    if (!hasCssLink || !hasHeader || !hasFooter) {
      failures += 1;
      console.log(
        `FAIL route=${check.route} css=${hasCssLink} header=${hasHeader} footer=${hasFooter} status=${response.status}`
      );
      continue;
    }

    for (const asset of collectAssets(body)) {
      allAssets.add(asset);
    }
  }

  console.log(`PASS route=${check.route} status=${response.status}`);
}

for (const asset of allAssets) {
  const url = `${baseUrl}${asset}`;
  const { response } = await fetchText(url);
  if (response.status !== 200) {
    failures += 1;
    assetFailures.push({ asset, status: response.status });
    console.log(`FAIL asset=${asset} status=${response.status}`);
    continue;
  }
  console.log(`PASS asset=${asset} status=${response.status}`);
}

if (failures > 0) {
  if (assetFailures.length > 0 && assetFailures.every((entry) => entry.status === 400)) {
    console.log(
      "[qa:smoke] hint: chunks/css returned 400. This usually means build/process mismatch (old next start with new .next). Restart server from current build and rerun."
    );
  }
  console.log(`[qa:smoke] completed with failures=${failures}`);
  process.exit(1);
}

console.log("[qa:smoke] all checks passed");
