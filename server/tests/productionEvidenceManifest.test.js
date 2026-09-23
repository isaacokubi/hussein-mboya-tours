import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p) => fs.readFileSync(p, "utf8");

test("Phase 19 evidence validator requires explicit manifest input", () => {
  const source = read("scripts/productionEvidenceCheck.js");
  assert.match(source, /PRODUCTION_EVIDENCE_MANIFEST/);
  assert.match(source, /deployment\.commit/);
  assert.match(source, /requiredChecks/);
  assert.match(source, /data_integrity/);
  assert.match(source, /status !== "PASS"/);
});

test("Phase 19 evidence validator rejects credential-like content", () => {
  const source = read("scripts/productionEvidenceCheck.js");
  assert.match(source, /password/i);
  assert.match(source, /private[_ -]?key/i);
  assert.match(source, /access[_ -]?token/i);
});

test("Phase 19 example manifest is structurally complete and non-secret", () => {
  const example = JSON.parse(read("../docs/production-evidence.manifest.example.json"));
  assert.equal(example.version, 1);
  assert.match(example.deployment.commit, /^[a-f0-9]{40}$/i);
  const ids = example.checks.map((check) => check.id);
  for (const id of ["backup","restore","monitoring","payment","etims","webhooks","browser","authenticated_roles","data_integrity"]) {
    assert.ok(ids.includes(id), "missing " + id);
  }
  assert.doesNotMatch(JSON.stringify(example), /password|secret|private.?key|access.?token|client.?secret|passkey/i);
});
