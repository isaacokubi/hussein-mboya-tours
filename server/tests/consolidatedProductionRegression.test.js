import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const readRoot = (path) => fs.readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const readServer = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("production regression guard: client startup has no unconditional runtime logging", () => {
  const source = readRoot("client/src/main.jsx");
  assert.match(source, /if \(import\.meta\.env\.DEV\)/);
  assert.doesNotMatch(source, /console\.log\(/);
});

test("production regression guard: destination API does not log payloads", () => {
  const source = readRoot("client/src/api/destinationApi.js");
  assert.doesNotMatch(source, /console\.(log|debug)\(/);
});

test("production regression guard: AI service does not expose configuration at startup", () => {
  const source = readServer("services/aiService.js");
  assert.doesNotMatch(source, /OPENAI KEY STATUS/);
  assert.doesNotMatch(source, /AI MODEL:/);
});

test("production regression guard: SEO and sitemap use configured public origin", () => {
  const seo = readRoot("client/src/components/seo/TourSchema.jsx");
  const sitemap = readServer("utils/sitemap.js");
  assert.doesNotMatch(seo, /husseinmboyatours\.com/);
  assert.doesNotMatch(sitemap, /husseinmboyatours\.com/);
  assert.match(sitemap, /PUBLIC_SITE_URL/);
  assert.match(sitemap, /https:\\/\\//);
});
