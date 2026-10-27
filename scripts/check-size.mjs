// Fails when the built JS and CSS, gzipped, exceed the budget in docs/DECISIONS.md.
// Run after `vite build`.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const BUDGET = 50 * 1024;
const dir = "dist/assets";

let total = 0;
for (const name of readdirSync(dir)) {
  if (!/\.(js|css)$/.test(name)) continue;
  const size = gzipSync(readFileSync(join(dir, name)), { level: 9 }).length;
  total += size;
  console.log(`${name.padEnd(32)} ${(size / 1024).toFixed(1).padStart(6)} KiB gzip`);
}
console.log(`${"total".padEnd(32)} ${(total / 1024).toFixed(1).padStart(6)} KiB gzip (budget ${BUDGET / 1024} KiB)`);
if (total > BUDGET) {
  console.error("Over the bundle budget.");
  process.exit(1);
}
