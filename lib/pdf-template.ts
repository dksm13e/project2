import type { PurchasedResult } from "@/lib/flow";
import type { ScenarioDefinition } from "@/lib/scenarios";

export type PdfSection = {
  title: string;
  items: string[];
};

export type PdfTemplateInput = {
  result: PurchasedResult;
  scenario: ScenarioDefinition;
  summary: string;
  recommendations: string[];
  sections: PdfSection[];
  notes: string[];
  disclaimer: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toList(items: string[]) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

export function buildPdfHtmlTemplate(input: PdfTemplateInput): string {
  const generated = new Date(input.result.createdAt).toLocaleString("ru-RU");

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(input.scenario.title)} - PDF Report</title>
<style>
  :root { color-scheme: light; }
  body {
    margin: 0;
    font-family: "Segoe UI", Arial, sans-serif;
    background: #f3f3f1;
    color: #1f211f;
  }
  .sheet {
    max-width: 860px;
    margin: 18px auto;
    background: #ffffff;
    border: 1px solid #deded9;
    border-radius: 18px;
    padding: 28px;
  }
  .meta {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    color: #5a5e5a;
    font-size: 12px;
    margin-bottom: 14px;
  }
  h1 {
    margin: 0;
    font-size: 28px;
    line-height: 1.2;
  }
  h2 {
    margin: 22px 0 10px;
    font-size: 15px;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: #5a5e5a;
  }
  p {
    margin: 0;
    line-height: 1.52;
    font-size: 14px;
  }
  .card {
    margin-top: 12px;
    border: 1px solid #e3e3de;
    border-radius: 12px;
    padding: 14px;
    background: #fbfbfa;
  }
  .grid {
    margin-top: 12px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .grid .card { margin-top: 0; background: #fff; }
  ul {
    margin: 8px 0 0;
    padding-left: 18px;
  }
  li {
    margin: 4px 0;
    font-size: 14px;
    line-height: 1.45;
  }
  .disclaimer {
    margin-top: 16px;
    border-top: 1px solid #e3e3de;
    padding-top: 10px;
    color: #666a66;
    font-size: 12px;
    line-height: 1.4;
  }
  @media print {
    body { background: #fff; }
    .sheet { margin: 0; border: 0; border-radius: 0; max-width: none; }
  }
</style>
</head>
<body>
  <main class="sheet">
    <div class="meta">
      <span>AI Shopping</span>
      <span>Generated: ${escapeHtml(generated)}</span>
      <span>Код доступа: ${escapeHtml(input.result.accessCode)}</span>
    </div>

    <h1>${escapeHtml(input.scenario.title)}</h1>

    <h2>Summary</h2>
    <div class="card"><p>${escapeHtml(input.summary)}</p></div>

    <h2>Actionable Recommendations</h2>
    <div class="card"><ul>${toList(input.recommendations)}</ul></div>

    <h2>Sections</h2>
    <div class="grid">
      ${input.sections
        .map(
          (section) => `
            <section class="card">
              <p><strong>${escapeHtml(section.title)}</strong></p>
              <ul>${toList(section.items)}</ul>
            </section>
          `
        )
        .join("")}
    </div>

    <h2>Notes</h2>
    <div class="card"><ul>${toList(input.notes)}</ul></div>

    <div class="disclaimer">${escapeHtml(input.disclaimer)}</div>
  </main>
</body>
</html>`;
}
