import fs from "fs";
import path from "path";

const root = process.cwd();
const routesDir = path.join(root, "routes");

const AUTH = [
  "protect",
  "authMiddleware",
  "authenticate",
  "isAuthenticated",
  "requireAuth",
  "adminMiddleware",
  "roleMiddleware",
  "authorize",
  "permissionMiddleware",
  "customerOnly",
  "adminOnly",
  "managerOnly",
  "agentOnly",
  "guideOnly",
  "driverOnly",
  "superAdminOnly",
  "superadminOnly"
];

const PUBLIC_EXCEPTIONS = [
  "login",
  "register",
  "signup",
  "forgot-password",
  "reset-password",
  "verify-email",
  "refresh",
  "health",
  "settings/public",
  "webhook",
  "callback"
];

const SENSITIVE = [
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

const WRITE = ["POST", "PUT", "PATCH", "DELETE"];

const routeFiles = fs
  .readdirSync(routesDir)
  .filter(file => file.endsWith(".js"))
  .sort();

const findings = [];

function hasAuth(text) {
  return AUTH.some(token => {
    const re = new RegExp(`\\b${token}\\b`, "i");
    return re.test(text);
  });
}

function isPublicException(route, text) {
  const lower = `${route} ${text}`.toLowerCase();
  return PUBLIC_EXCEPTIONS.some(x => lower.includes(x));
}

function isSensitive(route, file) {
  const lower = `${route} ${file}`.toLowerCase();
  return SENSITIVE.some(x => lower.includes(x));
}

function extractHandlers(file, content) {
  const lines = content.split("\n");
  const results = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const match = line.match(
      /router\.(get|post|put|patch|delete)\s*\((.*)/i
    );

    if (!match) continue;

    const method = match[1].toUpperCase();

    let block = line;

    for (let j = i + 1; j < Math.min(lines.length, i + 12); j++) {
      block += "\n" + lines[j];

      if (
        lines[j].includes(");") ||
        lines[j].includes(");")
      ) {
        break;
      }
    }

    const routeMatch = block.match(
      /router\.(?:get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)/
    );

    const route = routeMatch ? routeMatch[1] : "(dynamic/unknown)";

    results.push({
      file,
      line: i + 1,
      method,
      route,
      block
    });
  }

  return results;
}

for (const file of routeFiles) {
  const full = path.join(routesDir, file);
  const content = fs.readFileSync(full, "utf8");

  for (const handler of extractHandlers(file, content)) {
    const {
      method,
      route,
      block,
      line
    } = handler;

    const auth = hasAuth(block);
    const sensitive = isSensitive(route, file);
    const write = WRITE.includes(method);
    const exception = isPublicException(route, block);

    let classification = "LEGITIMATE_PUBLIC_OR_REVIEW";

    if (auth) {
      classification = "PROTECTED";
    } else if (exception) {
      classification = "PUBLIC_EXCEPTION";
    } else if (write && sensitive) {
      classification = "CRITICAL_UNPROTECTED_WRITE";
    } else if (write) {
      classification = "UNPROTECTED_WRITE";
    } else if (sensitive) {
      classification = "SENSITIVE_UNPROTECTED_READ";
    }

    if (
      classification === "CRITICAL_UNPROTECTED_WRITE" ||
      classification === "UNPROTECTED_WRITE" ||
      classification === "SENSITIVE_UNPROTECTED_READ"
    ) {
      findings.push({
        ...handler,
        classification
      });
    }
  }
}

console.log("");
console.log("============================================================");
console.log("PHASE 9 — RBAC ENFORCEMENT REPAIR AUDIT");
console.log("============================================================");
console.log("READ ONLY — NO FILES OR DATABASE RECORDS MODIFIED");
console.log("");

console.log(`Route files analysed: ${routeFiles.length}`);
console.log(`Potential security findings: ${findings.length}`);
console.log("");

const groups = [
  "CRITICAL_UNPROTECTED_WRITE",
  "UNPROTECTED_WRITE",
  "SENSITIVE_UNPROTECTED_READ"
];

for (const group of groups) {
  const rows = findings.filter(x => x.classification === group);

  console.log("");
  console.log("------------------------------------------------------------");
  console.log(group);
  console.log("------------------------------------------------------------");

  if (!rows.length) {
    console.log("NONE");
    continue;
  }

  for (const row of rows) {
    console.log(
      `${row.file}:${row.line} ${row.method} ${row.route}`
    );
  }

  console.log(`COUNT: ${rows.length}`);
}

console.log("");
console.log("------------------------------------------------------------");
console.log("HIGH PRIORITY FILES");
console.log("------------------------------------------------------------");

const priorityFiles = [
  "superAdminMaintenanceRoutes.js",
  "superAdminOperationsRoutes.js",
  "superAdminToolsRoutes.js",
  "superAdminRoutes.js",
  "adminRoleRoutes.js",
  "adminPaymentRoutes.js",
  "adminRoutes.js",
  "adminBookingRoutes.js",
  "adminTourRoutes.js",
  "adminDestinationRoutes.js",
  "adminGalleryRoutes.js",
  "adminReviewRoutes.js",
  "adminCouponRoutes.js",
  "tourManagerRoutes.js",
  "tourAssignmentRoutes.js",
  "tourRoutes.js",
  "agentBookingRoutes.js",
  "agentCustomerRoutes.js",
  "guideRoutes.js",
  "driverRoutes.js",
  "settingsRoutes.js",
  "securityRoutes.js"
];

for (const file of priorityFiles) {
  const rows = findings.filter(x => x.file === file);

  if (rows.length) {
    console.log("");
    console.log(`[${file}]`);

    for (const row of rows) {
      console.log(
        `  ${row.classification} ${row.method} ${row.route}`
      );
    }
  }
}

console.log("");
console.log("------------------------------------------------------------");
console.log("LEGACY ROLE REFERENCES");
console.log("------------------------------------------------------------");

const legacyPatterns = [
  "legacyRole",
  "roleName",
  "user.role",
  "user?.role",
  "user.roleId?.name || user.role",
  "user.roleId?.name || user.legacyRole"
];

const legacyFiles = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;

  for (const entry of fs.readdirSync(dir, {
    withFileTypes: true
  })) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name === "dist" ||
      entry.name === "build"
    ) {
      continue;
    }

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    if (!entry.name.endsWith(".js")) continue;

    const content = fs.readFileSync(full, "utf8");

    if (
      legacyPatterns.some(pattern =>
        content.includes(pattern)
      )
    ) {
      legacyFiles.push(path.relative(root, full));
    }
  }
}

for (const directory of [
  "middleware",
  "controllers",
  "services",
  "utils"
]) {
  walk(path.join(root, directory));
}

for (const file of [...new Set(legacyFiles)].sort()) {
  console.log(file);
}

console.log("");
console.log("------------------------------------------------------------");
console.log("RECOMMENDED PHASE 9 REPAIR ORDER");
console.log("------------------------------------------------------------");

console.log(`
1. superAdminMaintenanceRoutes.js
2. adminRoleRoutes.js
3. adminPaymentRoutes.js
4. adminRoutes.js
5. adminBookingRoutes.js
6. adminTourRoutes.js
7. adminDestinationRoutes.js
8. adminGalleryRoutes.js
9. adminReviewRoutes.js
10. tourManagerRoutes.js
11. tourAssignmentRoutes.js
12. tourRoutes.js
13. agentBookingRoutes.js
14. agentCustomerRoutes.js
15. guideRoutes.js
16. driverRoutes.js
17. settingsRoutes.js
18. securityRoutes.js
`);

console.log("");
console.log("------------------------------------------------------------");
console.log("PHASE 9 VERDICT");
console.log("------------------------------------------------------------");

const critical = findings.filter(
  x => x.classification === "CRITICAL_UNPROTECTED_WRITE"
).length;

const writes = findings.filter(
  x => x.classification === "UNPROTECTED_WRITE"
).length;

const reads = findings.filter(
  x => x.classification === "SENSITIVE_UNPROTECTED_READ"
).length;

console.log(`Critical sensitive writes: ${critical}`);
console.log(`Other unprotected writes:  ${writes}`);
console.log(`Sensitive unprotected GET: ${reads}`);
console.log(`Legacy-role files:         ${[...new Set(legacyFiles)].length}`);

console.log("");

if (critical > 0) {
  console.log("VERDICT: RED — critical RBAC enforcement gaps remain.");
} else if (writes > 0 || reads > 0) {
  console.log("VERDICT: AMBER — authorization gaps remain.");
} else {
  console.log("VERDICT: GREEN — no obvious RBAC gaps detected by this scanner.");
}

console.log("");
console.log("============================================================");
console.log("PHASE 9 AUDIT COMPLETE");
console.log("============================================================");
