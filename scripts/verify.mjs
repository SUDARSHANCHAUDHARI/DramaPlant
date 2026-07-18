import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const failures = [];

const requiredFiles = [
  ".gitignore",
  ".nojekyll",
  "AGENTS.md",
  "CHANGELOG.md",
  "LICENSE",
  "README.md",
  "SECURITY.md",
  "favicon.svg",
  "index.html",
  "package.json",
  "script.js",
  "site.webmanifest",
  "styles.css",
];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) {
    failures.push(`Missing required file: ${file}`);
  }
}

function read(file) {
  return readFileSync(join(root, file), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

const html = read("index.html");
const css = read("styles.css");
const javascript = read("script.js");
const readme = read("README.md");
const manifest = JSON.parse(read("site.webmanifest"));

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
assert(duplicateIds.length === 0, `Duplicate HTML IDs: ${duplicateIds.join(", ")}`);

const selectorIds = [...javascript.matchAll(/querySelector\("#([^"]+)"\)/g)].map(
  (match) => match[1],
);
const missingBindings = selectorIds.filter((id) => !ids.includes(id));
assert(missingBindings.length === 0, `JavaScript bindings missing from HTML: ${missingBindings.join(", ")}`);

const reactionIds = [...javascript.matchAll(/^\s{6}id: "([^"]+)",$/gm)].map((match) => match[1]);
assert(reactionIds.length === 10, `Expected 10 reactions, found ${reactionIds.length}`);
const missingReactionStyles = reactionIds.filter((id) => !css.includes(`reaction-${id}`));
assert(
  missingReactionStyles.length === 0,
  `Reactions missing CSS behavior: ${missingReactionStyles.join(", ")}`,
);

const localAssets = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((value) => !value.startsWith("#") && !value.startsWith("http") && value !== "./")
  .map((value) => value.replace(/^\.\//, ""));
const missingAssets = localAssets.filter((asset) => !existsSync(join(root, asset)));
assert(missingAssets.length === 0, `Missing local assets: ${missingAssets.join(", ")}`);

assert(manifest.name === "DramaPlant", "Manifest name must be DramaPlant");
assert(manifest.start_url === "./", "Manifest start_url must remain project-page safe");
assert(Array.isArray(manifest.icons) && manifest.icons.length > 0, "Manifest must define an icon");

const unsafeJavaScriptPatterns = [
  [/(^|[^\w])eval\s*\(/, "eval()"],
  [/new\s+Function\s*\(/, "new Function()"],
  [/document\.write\s*\(/, "document.write()"],
  [/\.innerHTML\s*=/, "innerHTML assignment"],
  [/insertAdjacentHTML\s*\(/, "insertAdjacentHTML()"],
];
for (const [pattern, label] of unsafeJavaScriptPatterns) {
  assert(!pattern.test(javascript), `Unsafe browser API found: ${label}`);
}

const csp = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/);
assert(Boolean(csp), "Content Security Policy meta tag is required");
for (const directive of ["default-src 'self'", "connect-src 'none'", "object-src 'none'", "script-src 'self'"]) {
  assert(csp?.[1].includes(directive), `CSP is missing: ${directive}`);
}

assert(html.includes('lang="en"'), "Document language is required");
assert(html.includes('id="live-status"'), "Accessible live status is required");
assert(html.includes('class="skip-link"'), "Skip link is required");
assert(html.includes('aria-keyshortcuts='), "Watering can keyboard shortcuts must be documented in markup");
assert(css.includes("prefers-reduced-motion: reduce"), "Reduced-motion styles are required");
assert(css.includes("touch-action: none"), "Touch drag handling is required");
assert(javascript.includes('event.key === " " || event.key === "Enter"'), "Keyboard pouring is required");
assert(readme.includes("pnpm verify"), "README must document the verification command");
assert(readme.includes("Deploy to GitHub Pages"), "README must document deployment");

if (failures.length > 0) {
  console.error("DramaPlant verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `DramaPlant verification passed: ${ids.length} unique IDs, ${selectorIds.length} DOM bindings, ` +
    `${reactionIds.length} reactions, and ${localAssets.length} local assets.`,
);
