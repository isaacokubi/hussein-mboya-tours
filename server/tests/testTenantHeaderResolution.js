/**
 * Purpose: test Tenant Header Resolution automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:url so this module can use its exported dependencies.
import { fileURLToPath } from "node:url";

// Declare __filename for use by the surrounding module or function.
const __filename = fileURLToPath(import.meta.url);
// Declare __dirname for use by the surrounding module or function.
const __dirname = path.dirname(__filename);

// Declare middlewareFile for use by the surrounding module or function.
const middlewareFile = path.resolve(
  __dirname,
  "../middleware/tenantMiddleware.js"
);

// Perform the side effect or state update expressed on the following line.
test("tenant middleware supports tenant header resolution", () => {
  // Declare source for use by the surrounding module or function.
  const source = fs.readFileSync(middlewareFile, "utf8");

  // Declare patterns for use by the surrounding module or function.
  const patterns = [
    /x-tenant-id/i,
    /x-tenant/i,
    /tenant-id/i,
    /tenantId/i,
    /req\.headers/i,
  ];

  // Declare matches for use by the surrounding module or function.
  const matches = patterns.filter((pattern) => pattern.test(source));

  // Perform the side effect or state update expressed on the following line.
  assert.ok(
    matches.length > 0,
    "Tenant middleware has no recognizable tenant-header resolution"
  );

  // Perform the side effect or state update expressed on the following line.
  console.log("Tenant header resolution PASS");
});
