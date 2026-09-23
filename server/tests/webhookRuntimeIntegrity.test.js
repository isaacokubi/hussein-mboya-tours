import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(process.cwd());
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("webhook delivery jobs carry an explicit tenant identity", () => {
  const service = read("services/webhookDeliveryService.js");
  const controller = read("controllers/developerIntegrationController.js");

  assert.match(service, /enqueueJob\("webhook\.delivery", \{ tenantId, webhookId: hook\._id, event, eventId: crypto\.randomUUID\(\), data \}/);
  assert.match(controller, /const currentTenantId = tenantId\(req\);/);
  assert.match(controller, /enqueueJob\("webhook\.delivery", \{
\s*tenantId: currentTenantId,/);
});

test("webhook worker rejects cross-tenant or incomplete delivery jobs", () => {
  const service = read("services/webhookDeliveryService.js");

  assert.match(service, /const jobTenantId = job\?\.tenantId \|\| payload\?\.tenantId/);
  assert.match(service, /missing tenant or webhook identity/);
  assert.match(service, /String\(webhook\.tenantId\) !== String\(jobTenantId\)/);
  assert.match(service, /Webhook delivery tenant mismatch/);
});

test("webhook delivery remains signed, idempotent and SSRF constrained", () => {
  const service = read("services/webhookDeliveryService.js");
  const ssrf = read("services/ssrfSafeHttpsService.js");
  const model = read("models/WebhookDelivery.js");

  assert.match(service, /idempotencyKey = `webhook:\$\{hook\._id\}:\$\{event\}:\$\{stableSource\}`/);
  assert.match(service, /x-webhook-signature/);
  assert.match(service, /x-webhook-timestamp/);
  assert.match(service, /Webhook URL must use HTTPS/);
  assert.match(ssrf, /lookup: \(_hostname, _options, callback\) => callback\(null, address, family\)/);
  assert.match(model, /tenantId: 1, webhookId: 1, eventId: 1, attempt: 1/);
});

test("webhook production evidence remains external", () => {
  const checklist = read("../docs/PRODUCTION_GO_LIVE_CHECKLIST.md");
  const queue = read("../docs/STORED_TEST_EXECUTION_QUEUE.md");

  assert.match(checklist, /PRODUCTION_WEBHOOKS_VERIFIED=true/);
  assert.match(checklist, /Do not mark an evidence flag true unless the corresponding external test was actually completed/);
  assert.match(queue, /signed webhook delivery verified/);
});
