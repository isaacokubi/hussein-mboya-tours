import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("../../", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), "utf8");

test("whole-system audit: critical public configuration is not hard-coded", () => {
  assert.doesNotMatch(read("client/src/components/seo/TourSchema.jsx"), /husseinmboyatours\.com/);
  assert.doesNotMatch(read("server/utils/sitemap.js"), /husseinmboyatours\.com/);
});

test("whole-system audit: sensitive diagnostic output is not unconditional", () => {
  assert.doesNotMatch(read("client/src/api/destinationApi.js"), /console\.(log|debug)\(/);
  assert.doesNotMatch(read("server/services/aiService.js"), /OPENAI KEY STATUS/);
  assert.doesNotMatch(read("server/services/aiService.js"), /AI MODEL:/);
});
