// tools/site-builder.mjs
// Minimal "section builder" that asks OpenAI to write ready-to-run files under /website

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { OpenAI } from "openai";

/* ---------- CLI ARGS ----------

Examples:
  node tools/site-builder.mjs --section Team --route /team --prefix team
  node tools/site-builder.mjs --section Method --route /method --prefix method --style "glass, indigo, Tailwind" --langs en,fr,de,es
*/
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) return [m[1], m[2]];
    const m2 = a.match(/^--(.+)$/);
    return m2 ? [m2[1], true] : [a, true];
  })
);

const SECTION = String(args.section || "Team");
const ROUTE = String(args.route || "/team");
const PREFIX = String(args.prefix || SECTION.toLowerCase());
const STYLE = String(args.style || "glass, indigo, Tailwind, modern, accessible, mobile-first");
const LANGS = String(args.langs || "en,fr,de,es")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Make sure key is present
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not set. Do:  $env:OPENAI_API_KEY=\"sk-...\"  (PowerShell) or export on mac/linux.");
  process.exit(1);
}

// Resolve repo root and /website
const repoRoot = path.resolve(process.cwd());
const siteRoot = path.resolve(repoRoot, "website");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** JSON schema for the model output (strict). */
const schema = {
  type: "object",
  properties: {
    files: {
      type: "array",
      description: "Each file to create/update in the /website app",
      items: {
        type: "object",
        properties: {
          path: { type: "string", description: "Relative path under /website, e.g. src/sections/Team.jsx" },
          content: { type: "string", description: "Full file content" }
        },
        required: ["path", "content"]
      }
    },
    notes: { type: "string", description: "Short integration notes for the developer" }
  },
  required: ["files"]
};

/** Prompt that instructs the model what to generate. */
const prompt = `
You are generating production-ready code for a React 18 + Vite + Tailwind site that lives under /website.

SECTION to build:
- name: ${SECTION}
- route: ${ROUTE}
- i18n prefix: ${PREFIX}
- style: ${STYLE}
- languages: ${LANGS.join(", ")}

Constraints:
- Create a React component at /website/src/sections/${SECTION}.jsx (default export).
- Pure React 18 + Tailwind (no extra UI libs). Use semantic HTML + a11y.
- Keep styling consistent with a "glass / indigo / clarity" aesthetic.
- If you need images, use placeholders already under /website/public/img or comment a TODO.
- Provide basic content (title, subtitle, bullets, CTA) as i18n keys, not hard-coded strings.
- Update /website/public/{lang}.json: add all keys under "${PREFIX}.*". DO NOT remove existing keys.
- OPTIONAL: If a route file is needed, create /website/src/routes/${PREFIX}.jsx with a simple wrapper that renders the section.
- Avoid absolute imports; assume Vite default config (src relative ok).
- ESLint-friendly, no unused imports.
- DO NOT include API keys or secrets.
- Return ONLY JSON that matches the given JSON schema.

Deliver:
- files[]: { path, content } for every file you create/update (components + each i18n JSON).
- notes: a 1-line note explaining what to import into Site.jsx and how to add the route if needed.
`;

async function run() {
  console.log(`🚀 Generating section "${SECTION}" at route "${ROUTE}" with i18n prefix "${PREFIX}" ...`);
  const resp = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
    response_format: { type: "json_schema", json_schema: { name: "bundle", schema, strict: true } }
  });

  // The SDK exposes a convenience: resp.output_text is the primary generated text piece
  const jsonText = resp.output_text;
  let out;
  try {
    out = JSON.parse(jsonText);
  } catch (e) {
    console.error("❌ Could not parse JSON from model:", e.message);
    process.exit(1);
  }

  if (!out.files?.length) {
    console.error("❌ Model returned no files. Full output:", out);
    process.exit(1);
  }

  // Write files
  for (const f of out.files) {
    const full = path.resolve(siteRoot, f.path);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, f.content, "utf8");
    console.log("✍️  wrote", path.relative(repoRoot, full));
  }

  // Optional formatting with Prettier if installed
  try {
    const prettier = await import("prettier");
    for (const f of out.files) {
      const full = path.resolve(siteRoot, f.path);
      const content = await fs.readFile(full, "utf8");
      const formatted = await prettier.format(content, { filepath: full });
      await fs.writeFile(full, formatted, "utf8");
    }
    console.log("✨ formatted with Prettier");
  } catch {
    // Prettier not installed — ignore
  }

  console.log("\n📝 Notes:", out.notes || "(none)");
  console.log("\n✅ Done. Next:  cd website && npm run dev   (or netlify dev)");
}

run().catch((e) => {
  console.error("❌ Unhandled error:", e);
  process.exit(1);
});
