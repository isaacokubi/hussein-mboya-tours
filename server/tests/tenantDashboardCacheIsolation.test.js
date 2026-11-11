/**
 * Purpose: tenant Dashboard Cache Isolation.test automated test. Main declarations: read.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";

// Declare read for use by the surrounding module or function.
const read = (relativePath) => fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

// Perform the side effect or state update expressed on the following line.
test("logging in as another tenant clears all in-memory query data", () => {
  // Declare auth for use by the surrounding module or function.
  const auth = read("../client/src/context/AuthContext.jsx");
  // Declare login for use by the surrounding module or function.
  const login = auth.match(/const login = async \(email, password\) => \{[\s\S]*?\n  \};/)?.[0];
  // Perform the side effect or state update expressed on the following line.
  assert.ok(login, "AuthContext login implementation exists");
  // Perform the side effect or state update expressed on the following line.
  assert.match(login, /queryClient\.clear\(\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.ok(
    login.indexOf("queryClient.clear()") < login.indexOf('api.post("/auth/login"'),
    "clear cached tenant data before authenticating the next account",
  );
});

// Perform the side effect or state update expressed on the following line.
test("admin dashboard cache key uses authenticated tenant identity", () => {
  // Declare dashboard for use by the surrounding module or function.
  const dashboard = read("../client/src/components/admin/dashboard/AdminDashboard.jsx");
  // Perform the side effect or state update expressed on the following line.
  assert.match(dashboard, /import \{ useAuth \} from "\.\.\/\.\.\/\.\.\/context\/AuthContext"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(dashboard, /const authenticatedTenantId = user\?\.tenantId\?\._id \|\| user\?\.tenantId/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(dashboard, /queryKey: \["admin-dashboard", tenantKey\]/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(dashboard, /const tenantKey = tenant\?\._id \|\| tenant\?\.id \|\| tenant\?\.slug \|\| "current"/);
});
