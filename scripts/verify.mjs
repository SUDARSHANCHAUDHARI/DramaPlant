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

function contrastRatio(first, second) {
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/.{2}/g).map((value) => Number.parseInt(value, 16) / 255);
    const linear = channels.map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function ruleBody(selector, source = css) {
  const start = source.indexOf(`${selector} {`);
  if (start < 0) {
    failures.push(`Missing CSS rule ${selector}`);
    return "";
  }
  return source.slice(source.indexOf("{", start) + 1, source.indexOf("}", start));
}

function declaration(selector, property, source = css) {
  const match = ruleBody(selector, source).match(
    new RegExp(`(?:^|\\n)\\s*${property.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\s*:\\s*([\\s\\S]*?);`),
  );
  if (!match) {
    failures.push(`Missing ${property} in ${selector}`);
    return "";
  }
  return match[1].trim();
}

function resolvedColor(value, seen = new Set()) {
  const variable = value.match(/^var\(--([^)]+)\)$/);
  if (!variable) {
    if (!/^#[0-9a-f]{6}$/i.test(value)) {
      failures.push(`Unsupported color ${value}`);
      return "#000000";
    }
    return value.toLowerCase();
  }
  if (seen.has(variable[1])) {
    failures.push(`Circular CSS variable --${variable[1]}`);
    return "#000000";
  }
  seen.add(variable[1]);
  return resolvedColor(declaration(":root", `--${variable[1]}`), seen);
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
for (const color of ["#15152a", "#fff5df", "#ff5d5d", "#4f7cff", "#ffd166", "#58d6a9", "#b695ff"]) {
  assert(css.toLowerCase().includes(color), `Missing shared TinyChaos color ${color}`);
}
assert(html.includes('href="https://sudarshanchaudhari.github.io/TinyChaos/"'), "TinyChaos gallery link is required");
assert(html.includes("DramaPlant · by Sudarshan Chaudhari"), "Author attribution is required");
assert(html.includes("Made with sunlight, SVG, and questionable plant psychology."), "Original footer story copy is required");
assert(/outline:\s*4px solid var\(--blue\)/.test(css), "Focus treatment must use TinyChaos blue");
assert(/\.watering-can:focus-visible\s*\{[^}]*var\(--blue\)[^}]*var\(--paper\)[^}]*var\(--ink\)/s.test(css), "Watering can focus needs a contrast halo");
assert(/input\[type="range"\]:focus-visible\s*\{[^}]*var\(--blue\)[^}]*var\(--paper\)[^}]*var\(--ink\)/s.test(css), "Range focus needs a contrast halo");
assert(/--display:\s*Impact/.test(css), "Display typography must use the condensed family stack");
assert(/--body:\s*"Arial Rounded MT Bold"/.test(css), "Body typography must use the rounded family stack");
assert(/overflow-x:\s*clip/.test(css), "Page overflow must be clipped without a fixed minimum width");
assert(contrastRatio("#4f7cff", "#fff5df") >= 3, "Blue focus must contrast with paper");
assert(contrastRatio("#4f7cff", "#15152a") >= 3, "Blue focus must contrast with ink");
const lilacSurface = resolvedColor(declaration(".diary-stats .stat-card:nth-child(1)", "background"));
for (const selector of [".stat-label", ".stat-total"]) {
  assert(
    contrastRatio(resolvedColor(declaration(selector, "color")), lilacSurface) >= 4.5,
    `${selector} must meet WCAG AA on exact lilac`,
  );
}

const widths = [...css.matchAll(/@media \(max-width: (\d+)px\)\s*\{/g)].map((match) => Number(match[1]));
assert(JSON.stringify(widths) === JSON.stringify([1040, 720, 430]), "Width breakpoints must cover laptop, tablet, and 320/375px layouts");
const positions = [
  css.indexOf("@media (max-width: 1040px) {"),
  css.indexOf("@media (max-width: 720px) {"),
  css.indexOf("@media (max-width: 430px) {"),
  css.indexOf("@media (max-width: 720px) and (max-height: 500px) {"),
  css.indexOf("@media (prefers-reduced-motion: reduce) {"),
];
assert(positions.every((position) => position >= 0), "A required responsive media query is missing");
assert(JSON.stringify([...positions].sort((a, b) => a - b)) === JSON.stringify(positions), "Responsive cascade order changed");
const narrowSection = css.slice(positions[3], positions[4]);
assert(declaration(".game-stage", "height", narrowSection) === "420px", "Narrow/short stage height changed");
assert(declaration(".game-stage", "min-height", narrowSection) === "420px", "Narrow/short stage minimum changed");
assert(!/\.game-stage\s*\{[^}]*(?:height|min-height)\s*:/s.test(css.slice(positions[4])), "A later rule overrides narrow/short stage geometry");
assert(declaration("body", "overflow-y") === "auto", "Short viewports must retain vertical scrolling");
assert(declaration("body", "overflow-x") === "clip", "Horizontal page overflow must remain clipped");
assert(declaration("body", "min-width") === "0", "Body must not impose a positive minimum width");
assert(!/min-width\s*:\s*(?!0(?:px)?\s*;)/.test(ruleBody("html")), "HTML has a positive minimum width");
assert(/1440px/.test(declaration(".game-layout", "width")), "Base rule must retain large-desktop cap");
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
