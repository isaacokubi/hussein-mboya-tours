import fs from "fs";
import path from "path";

const root = process.cwd();
const routesDir = path.join(root, "routes");

const AUTH_TOKENS = [
  "protect",
  "authMiddleware",
  "authenticate",
  "isAuthenticated",
  "requireAuth",
  "adminMiddleware",
  "roleMiddleware",
  "authorize",
  "permissionMiddleware",
  "checkPermission",
  "customerOnly",
  "adminOnly",
  "managerOnly",
  "agentOnly",
  "guideOnly",
  "driverOnly",
  "superAdminOnly",
  "superadminOnly",
  "tourManagerOnly"
];

const PUBLIC_ROUTE_PATTERNS = [
  "/login",
  "/register",
  "/signup",
  "/password-reset",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/refresh",
  "/health",
  "/test",
  "/validate",
  "/webhook",
  "/callback",
  "/search",
  "/featured",
  "/slug/"
];

const SENSITIVE_PATTERNS = [
  "admin",
  "superadmin",
  "security",
  "audit",
  "database",
  "backup",
  "cache",
  "payment",
  "refund",
  "finance",
  "commission",
  "role",
  "permission",
  "user",
  "staff",
  "settings",
  "report",
  "coupon",
  "tour",
  "booking",
  "vehicle",
  "driver",
  "guide",
  "agent"
];

const WRITE_METHODS = new Set([
  "POST",
  "PUT",
  "PATCH",
  "DELETE"
]);

const files = fs
  .readdirSync(routesDir)
  .filter((f) => f.endsWith(".js"))
  .sort();

function containsAuth(text) {
  return AUTH_TOKENS.some((token) =>
    new RegExp(`\\b${token}\\b`, "i").test(text)
  );
}

function extractRouterMiddleware(content) {
  const middleware = [];

  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!/router\.use\s*\(/i.test(line)) continue;

    let block = line;

    for (
      let j = i + 1;
      j < Math.min(lines.length, i + 10);
      j++
    ) {
      block += "\n" + lines[j];

      if (lines[j].includes(");")) break;
    }

    if (containsAuth(block)) {
      middleware.push({
        line: i + 1,
        text: block
      });
    }
  }

  return middleware;
}

function extractRoutes(content) {
  const lines = content.split("\n");
  const routes = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const match = line.match(
      /router\.(get|post|put|patch|delete)\s*\(/i
    );

    if (!match) continue;

    const method = match[1].toUpperCase();

    let block = line;

    for (
      let j = i + 1;
      j < Math.min(lines.length, i + 15);
      j++
    ) {
      block += "\n" + lines[j];

      if (lines[j].includes(");")) break;
    }

    const routeMatch = block.match(
      /router\.(?:get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)/
    );

    routes.push({
      line: i + 1,
      method,
      route: routeMatch?.[1] || "(dynamic/unknown)",
      block
    });
  }

  return routes;
}

function isPublic(route, block) {
  const value = `${route} ${block}`.toLowerCase();

  return PUBLIC_ROUTE_PATTERNS.some((pattern) =>
    value.includes(pattern.toLowerCase())
  );
}

function isSensitive(route, file) {
  const value = `${route} ${file}`.toLowerCase();

  return SENSITIVE_PATTERNS.some((pattern) =>
    value.includes(pattern)
  );
}

function permissionNames(text) {
  const permissions = [];

  const regexes = [
    /authorize\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/gi,
    /checkPermission\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/gi
  ];

  for (const regex of regexes) {
    let match;

    while ((match = regex.exec(text))) {
      permissions.push(match[1]);
    }
  }

  return [...new Set(permissions)];
}

const findings = [];

for (const file of files) {
  const full = path.join(routesDir, file);
  const content = fs.readFileSync(full, "utf8");

  const routerMiddleware = extractRouterMiddleware(content);
  const routes = extractRoutes(content);

  const routerHasAuth = routerMiddleware.length > 0;

  const routerPermissions = permissionNames(
    routerMiddleware.map((x) => x.text).join("\n")
  );

  for (const route of routes) {
    const routeAuth = containsAuth(route.block);
    const permissions = permissionNames(route.block);

    const protectedByRouter = routerHasAuth;
    const protectedByRoute = routeAuth;

    const protectedRoute =
      protectedByRouter || protectedByRoute;

    const publicRoute = isPublic(
      route.route,
      route.block
    );

    const sensitive = isSensitive(
      route.route,
      file
    );

    const write = WRITE_METHODS.has(route.method);

    let classification = "OK";

    if (!protectedRoute && publicRoute) {
      classification = "PUBLIC";
    } else if (!protectedRoute && write && sensitive) {
      classification = "CRITICAL_UNPROTECTED_WRITE";
    } else if (!protectedRoute && write) {
      classification = "UNPROTECTED_WRITE";
    } else if (!protectedRoute && sensitive) {
      classification = "SENSITIVE_UNPROTECTED_READ";
    } else if (protectedRoute && sensitive && permissions.length === 0 && routerPermissions.length === 0) {
      classification = "AUTH_ONLY_NO_EXPLICIT_PERMISSION";
    }

    if (classification !== "OK") {
      findings.push({
        file,
        line: route.line,
        method: route.method,
        route: route.route,
        classification,
        routerHasAuth,
        routerPermissions,
        routePermissions: permissions
      });
    }
  }
}

console.log("");
console.log("============================================================");
console.log("PHASE 9B — CONTEXT-AWARE RBAC AUDIT");
console.log("============================================================");
console.log("");

console.log(`Route files analysed: ${files.length}`);
console.log(`Findings after router-level analysis: ${findings.length}`);
console.log("");

const groups = [
  "CRITICAL_UNPROTECTED_WRITE",
  "UNPROTECTED_WRITE",
  "SENSITIVE_UNPROTECTED_READ",
  "AUTH_ONLY_NO_EXPLICIT_PERMISSION",
  "PUBLIC"
];

for (const group of groups) {
  const rows = findings.filter(
    (x) => x.classification === group
  );

  console.log("");
  console.log("------------------------------------------------------------");
  console.log(group);
  console.log("------------------------------------------------------------");

  if (!rows.length) {
    console.log("NONE");
    continue;
  }

  for (const row of rows) {
    const context =
      row.routerPermissions.length
        ? `router permissions=${row.routerPermissions.join(",")}`
        : row.routePermissions.length
        ? `route permissions=${row.routePermissions.join(",")}`
        : row.routerHasAuth
        ? "router-authenticated"
        : "NO-AUTH";

    console.log(
      `${row.file}:${row.line} ${row.method} ${row.route} [${context}]`
    );
  }

  console.log(`COUNT: ${rows.length}`);
}

console.log("");
console.log("------------------------------------------------------------");
console.log("ROUTER-LEVEL PROTECTION MAP");
console.log("------------------------------------------------------------");

for (const file of files) {
  const full = path.join(routesDir, file);
  const content = fs.readFileSync(full, "utf8");

  const middleware = extractRouterMiddleware(content);

  if (!middleware.length) {
    continue;
  }

  console.log("");
  console.log(`[${file}]`);

  for (const item of middleware) {
    const permissions = permissionNames(item.text);

    console.log(
      `  line ${item.line}: ${permissions.length
        ? permissions.join(", ")
        : "authentication/role middleware"}`
    );
  }
}

console.log("");
console.log("------------------------------------------------------------");
console.log("PHASE 9B VERDICT");
console.log("------------------------------------------------------------");

const critical = findings.filter(
  (x) => x.classification === "CRITICAL_UNPROTECTED_WRITE"
).length;

const writes = findings.filter(
  (x) => x.classification === "UNPROTECTED_WRITE"
).length;

const reads = findings.filter(
  (x) => x.classification === "SENSITIVE_UNPROTECTED_READ"
).length;

const authOnly = findings.filter(
  (x) => x.classification === "AUTH_ONLY_NO_EXPLICIT_PERMISSION"
).length;

console.log(`Critical unprotected writes: ${critical}`);
console.log(`Other unprotected writes:    ${writes}`);
console.log(`Sensitive unprotected reads: ${reads}`);
console.log(`Auth-only routes:             ${authOnly}`);

console.log("");

if (critical > 0) {
  console.log(
    "VERDICT: RED — genuine unprotected sensitive writes remain."
  );
} else if (writes > 0 || reads > 0) {
  console.log(
    "VERDICT: AMBER — authorization gaps remain."
  );
} else if (authOnly > 0) {
  console.log(
    "VERDICT: AMBER — routes are authenticated but need permission review."
  );
} else {
  console.log(
    "VERDICT: GREEN — no obvious RBAC gaps detected."
  );
}

console.log("");
console.log("============================================================");
console.log("PHASE 9B COMPLETE");
console.log("============================================================");
