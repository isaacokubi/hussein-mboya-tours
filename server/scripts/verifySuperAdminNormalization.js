import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = path.resolve(SCRIPT_DIR, "..");
const PROJECT_ROOT = path.resolve(SERVER_ROOT, "..");

const CANONICAL_ROLE = "super_admin";
const LEGACY_ROLE = "superadmin";

const EXCLUDED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
  ".cache",
  "vendor",
]);

const EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, {
    withFileTypes: true,
  })) {
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) {
        walk(path.join(dir, entry.name), files);
      }
      continue;
    }

    const file = path.join(dir, entry.name);

    if (EXTENSIONS.has(path.extname(file))) {
      files.push(file);
    }
  }

  return files;
}

function relative(file) {
  return path.relative(PROJECT_ROOT, file);
}

function runCheck(command, args, cwd, label) {
  console.log(`\nCHECK: ${label}`);

  try {
    execFileSync(command, args, {
      cwd,
      stdio: "inherit",
    });

    console.log(`PASS: ${label}`);
    return true;
  } catch {
    console.error(`FAIL: ${label}`);
    return false;
  }
}

console.log(`
============================================================
 COHERENT TOURS
 SUPERADMIN NORMALIZATION VERIFICATION
============================================================

Repository:
  ${PROJECT_ROOT}

Canonical role:
  ${CANONICAL_ROLE}

Legacy role:
  ${LEGACY_ROLE}
============================================================
`);

const files = [
  ...new Set([
    ...walk(SERVER_ROOT),
    ...walk(path.join(PROJECT_ROOT, "client")),
  ]),
];

console.log(`Files discovered: ${files.length}`);

let failures = 0;

/*
 * ----------------------------------------------------------
 * 1. SEARCH FOR LEGACY ROLE REFERENCES
 * ----------------------------------------------------------
 */

console.log(`
------------------------------------------------------------
 STEP 1: SEARCH FOR LEGACY ROLE REFERENCES
------------------------------------------------------------
`);

const legacyPatterns = [
  /["'`]superadmin["'`]/,
  /\bsuperadmin\b/,
];

const legacyMatches = [];

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const lines = source.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const pattern of legacyPatterns) {
      if (pattern.test(line)) {
        legacyMatches.push({
          file: relative(file),
          line: index + 1,
          text: line.trim(),
        });
        break;
      }
    }
  });
}

if (legacyMatches.length > 0) {
  console.log(
    `WARNING: ${legacyMatches.length} legacy references found.`
  );

  for (const match of legacyMatches.slice(0, 100)) {
    console.log(
      `  ${match.file}:${match.line} -> ${match.text}`
    );
  }

  if (legacyMatches.length > 100) {
    console.log(
      `  ... ${legacyMatches.length - 100} additional matches`
    );
  }

  /*
   * Do not immediately fail because comments, filenames,
   * migration notes, or historical scripts may legitimately
   * contain the old name.
   */
} else {
  console.log(
    "PASS: no legacy 'superadmin' references found."
  );
}

/*
 * ----------------------------------------------------------
 * 2. CHECK SERVER JAVASCRIPT SYNTAX
 * ----------------------------------------------------------
 */

console.log(`
------------------------------------------------------------
 STEP 2: SERVER JAVASCRIPT SYNTAX
------------------------------------------------------------
`);

const serverFiles = files.filter((file) =>
  file.startsWith(SERVER_ROOT)
);

for (const file of serverFiles) {
  const ext = path.extname(file);

  if (![".js", ".mjs", ".cjs"].includes(ext)) {
    continue;
  }

  try {
    execFileSync(
      process.execPath,
      ["--check", file],
      {
        cwd: SERVER_ROOT,
        stdio: "pipe",
      }
    );
  } catch (error) {
    failures++;

    console.error(
      `FAIL SYNTAX: ${relative(file)}`
    );

    if (error.stderr) {
      console.error(
        error.stderr.toString()
      );
    }
  }
}

if (failures === 0) {
  console.log(
    `PASS: server JavaScript syntax verified.`
  );
} else {
  console.error(
    `FAIL: ${failures} server JavaScript syntax errors.`
  );
}

/*
 * ----------------------------------------------------------
 * 3. CHECK PACKAGE SCRIPTS
 * ----------------------------------------------------------
 */

console.log(`
------------------------------------------------------------
 STEP 3: PACKAGE / BUILD CHECKS
------------------------------------------------------------
`);

const serverPackage =
  path.join(SERVER_ROOT, "package.json");

const clientPackage =
  path.join(PROJECT_ROOT, "client", "package.json");

if (fs.existsSync(serverPackage)) {
  console.log(
    `Server package: ${serverPackage}`
  );

  try {
    const pkg = JSON.parse(
      fs.readFileSync(serverPackage, "utf8")
    );

    console.log(
      `Server package name: ${pkg.name || "N/A"}`
    );
  } catch {
    failures++;
    console.error(
      "FAIL: server/package.json is invalid JSON."
    );
  }
}

if (fs.existsSync(clientPackage)) {
  console.log(
    `Client package: ${clientPackage}`
  );

  try {
    const pkg = JSON.parse(
      fs.readFileSync(clientPackage, "utf8")
    );

    console.log(
      `Client package name: ${pkg.name || "N/A"}`
    );
  } catch {
    failures++;
    console.error(
      "FAIL: client/package.json is invalid JSON."
    );
  }
}

/*
 * ----------------------------------------------------------
 * 4. CLIENT BUILD
 * ----------------------------------------------------------
 */

if (fs.existsSync(clientPackage)) {
  const clientDir =
    path.join(PROJECT_ROOT, "client");

  const clientPkg = JSON.parse(
    fs.readFileSync(clientPackage, "utf8")
  );

  if (
    clientPkg.scripts &&
    clientPkg.scripts.build
  ) {
    const ok = runCheck(
      process.platform === "win32"
        ? "npm.cmd"
        : "npm",
      ["run", "build"],
      clientDir,
      "React/Vite production build"
    );

    if (!ok) failures++;
  } else {
    console.log(
      "INFO: client build script not defined."
    );
  }
}

/*
 * ----------------------------------------------------------
 * 5. SERVER TEST SCRIPT
 * ----------------------------------------------------------
 */

if (fs.existsSync(serverPackage)) {
  const serverDir = SERVER_ROOT;

  const serverPkg = JSON.parse(
    fs.readFileSync(serverPackage, "utf8")
  );

  if (
    serverPkg.scripts &&
    serverPkg.scripts.test
  ) {
    const ok = runCheck(
      process.platform === "win32"
        ? "npm.cmd"
        : "npm",
      ["test"],
      serverDir,
      "Server test suite"
    );

    if (!ok) failures++;
  } else {
    console.log(
      "INFO: no server test script defined."
    );
  }
}

/*
 * ----------------------------------------------------------
 * 6. CRITICAL AUTH FILE REVIEW
 * ----------------------------------------------------------
 */

console.log(`
------------------------------------------------------------
 STEP 6: CRITICAL AUTH FILE REVIEW
------------------------------------------------------------
`);

const criticalFiles = [
  "server/middleware/authMiddleware.js",
  "server/middleware/roleMiddleware.js",
  "server/middleware/permissionMiddleware.js",
  "server/middleware/adminMiddleware.js",
  "server/utils/roleUtils.js",
  "server/models/User.js",
  "server/controllers/authController.js",
  "client/src/context/AuthContext.jsx",
  "client/src/components/auth/ProtectedRoute.jsx",
  "client/src/components/PermissionGuard.jsx",
  "client/src/utils/roleUtils.js",
];

for (const relativeFile of criticalFiles) {
  const file = path.join(
    PROJECT_ROOT,
    relativeFile
  );

  if (!fs.existsSync(file)) {
    console.log(
      `INFO: ${relativeFile} not found.`
    );
    continue;
  }

  const source = fs.readFileSync(
    file,
    "utf8"
  );

  const hasCanonical =
    source.includes(CANONICAL_ROLE);

  console.log(
    `${hasCanonical ? "PASS" : "REVIEW"}: ${relativeFile}`
  );
}

/*
 * ----------------------------------------------------------
 * 7. GIT DIFF SUMMARY
 * ----------------------------------------------------------
 */

console.log(`
------------------------------------------------------------
 STEP 7: GIT DIFF SUMMARY
------------------------------------------------------------
`);

try {
  const diffStat = execFileSync(
    "git",
    ["diff", "--stat", "--", "server", "client"],
    {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
    }
  );

  console.log(
    diffStat || "No tracked changes."
  );
} catch {
  console.log(
    "INFO: Git diff unavailable."
  );
}

/*
 * ----------------------------------------------------------
 * FINAL
 * ----------------------------------------------------------
 */

console.log(`
============================================================
 VERIFICATION COMPLETE
============================================================
`);

if (failures > 0) {
  console.error(
    `STATUS: FAILED - ${failures} blocking check(s).`
  );

  process.exitCode = 1;
} else {
  console.log(
    "STATUS: PASS"
  );

  console.log(`
Next steps:

1. Review the git diff.
2. Run the RBAC audit.
3. Run the server.
4. Test SuperAdmin login.
5. Test /superadmin dashboard.
6. Test admin authorization.
7. Test tenant isolation.
8. Only then commit and deploy.
`);
}
