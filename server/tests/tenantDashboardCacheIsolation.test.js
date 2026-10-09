import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = (relativePath) => fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

test("logging in as another tenant clears all in-memory query data", () => {
  const auth = read("../client/src/context/AuthContext.jsx");
  const login = auth.match(/const login = async \(email, password\) => \{[\s\S]*?\n  \};/)?.[0];
  assert.ok(login, "AuthContext login implementation exists");
  assert.match(login, /queryClient\.clear\(\)/);
  assert.ok(
    login.indexOf("queryClient.clear()") < login.indexOf('api.post("/auth/login"'),
    "clear cached tenant data before authenticating the next account",
  );
});

test("admin dashboard cache key uses authenticated tenant identity", () => {
  const dashboard = read("../client/src/components/admin/dashboard/AdminDashboard.jsx");
  assert.match(dashboard, /import \{ useAuth \} from "\.\.\/\.\.\/\.\.\/context\/AuthContext"/);
  assert.match(dashboard, /const authenticatedTenantId = user\?\.tenantId\?\._id \|\| user\?\.tenantId/);
  assert.match(dashboard, /queryKey: \["admin-dashboard", tenantKey\]/);
  assert.doesNotMatch(dashboard, /const tenantKey = tenant\?\._id \|\| tenant\?\.id \|\| tenant\?\.slug \|\| "current"/);
});
