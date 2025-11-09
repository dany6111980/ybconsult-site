// Auto-append a timestamped line into ../docs/PROJECT_LOG.md
// Usage: npm run log -- "Your message here"
// TZ: Europe/Brussels
import { appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logPath = resolve(__dirname, "../docs/PROJECT_LOG.md");

const msg = process.argv.slice(2).join(" ") || "(no message)";
const now = new Date();
const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Brussels",
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit"
}).format(now);

const line = - **[]** *Auto*: \n;
appendFileSync(logPath, line, { encoding: "utf8" });
console.log("Logged:", line.trim());
