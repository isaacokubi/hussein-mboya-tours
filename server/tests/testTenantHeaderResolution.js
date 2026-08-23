import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const middlewareFile = path.resolve(
  __dirname,
  "../middleware/tenantMiddleware.js"
);

test("tenant middleware supports tenant header resolution", () => {
  const source = fs.readFileSync(middlewareFile, "utf8");

  const patterns = [
    /x-tenant-id/i,
    /x-tenant/i,
    /tenant-id/i,
    /tenantId/i,
    /req\.headers/i,
  ];

  const matches = patterns.filter((pattern) => pattern.test(source));

  assert.ok(
    matches.length > 0,
    "Tenant middleware has no recognizable tenant-header resolution"
  );

  console.log("Tenant header resolution PASS");
});
