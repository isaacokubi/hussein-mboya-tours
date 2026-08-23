#!/usr/bin/env node

/**
 * Coherent Tours
 * SuperAdmin / RBAC / Multitenancy Automated Repair
 *
 * PURPOSE
 * -------
 * Normalizes SuperAdmin handling across the ACTIVE repository.
 *
 * Canonical role:
 *   superadmin
 *
 * Legacy role:
 *   super_admin
 *
 * IMPORTANT:
 *   - Backup directories are NEVER modified.
 *   - .env files are NEVER modified.
 *   - node_modules are NEVER modified.
 *   - A timestamped source backup is created before changes.
 *
 * Run:
 *   node server/scripts/repairSuperAdminRBAC.js
 *
 * Optional dry run:
 *   DRY_RUN=true node server/scripts/repairSuperAdminRBAC.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_DIR = path.resolve(__dirname, "..");
const ROOT_DIR = path.resolve(SERVER_DIR, "..");

const DRY_RUN = String(process.env.DRY_RUN || "").toLowerCase() === "true";

const timestamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

const BACKUP_DIR = path.join(
  ROOT_DIR,
  "server",
  `rbac-repair-backup-${timestamp}`
);

const REPORT_FILE = path.join(
  ROOT_DIR,
  "server",
  `superadmin-rbac-audit-${timestamp}.txt`
);

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  ".cache",
  ".vite",
]);

const SOURCE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
]);

const LEGACY_BACKUP_PREFIXES = [
  "superadmin-role-backups-",
  "rbac-repair-backup-",
];

const changes = [];
const warnings = [];
const errors = [];

function log(message = "") {
  console.log(message);
}

function isBackupDirectory(name) {
  return LEGACY_BACKUP_PREFIXES.some((prefix) =>
    name.startsWith(prefix)
  );
}

function shouldSkipDirectory(name) {
  return (
    SKIP_DIRS.has(name) ||
    isBackupDirectory(name)
  );
}

function isSourceFile(file) {
  return SOURCE_EXTENSIONS.has(path.extname(file));
}

function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, {
    withFileTypes: true,
  })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (shouldSkipDirectory(entry.name)) continue;
      walk(fullPath, results);
      continue;
    }

    if (!entry.isFile()) continue;

    if (!isSourceFile(entry.name)) continue;

    if (
      entry.name === "repairSuperAdminRBAC.js"
    ) {
      continue;
    }

    results.push(fullPath);
  }

  return results;
}

function relative(file) {
  return path.relative(ROOT_DIR, file);
}

function ensureBackupDirectory() {
  if (DRY_RUN) return;

  fs.mkdirSync(BACKUP_DIR, {
    recursive: true,
  });
}

function backupFile(file) {
  if (DRY_RUN) return;

  const rel = path.relative(ROOT_DIR, file);
  const destination = path.join(BACKUP_DIR, rel);

  fs.mkdirSync(path.dirname(destination), {
    recursive: true,
  });

  fs.copyFileSync(file, destination);
}

function writeReport(lines) {
  fs.writeFileSync(
    REPORT_FILE,
    lines.join("\n") + "\n",
    "utf8"
  );
}

function replaceAll(text, search, replacement) {
  return text.split(search).join(replacement);
}

function normalizeSuperAdminChecks(content) {
  let result = content;

  /*
   * Canonicalize simple arrays.
   *
   * Before:
   * ["superadmin", "super_admin"]
   *
   * After:
   * ["superadmin"]
   *
   * This is safe because roleUtils.js will remain
   * responsible for legacy normalization.
   */

  result = replaceAll(
    result,
    '["superadmin", "super_admin"]',
    '["superadmin"]'
  );

  result = replaceAll(
    result,
    '["super_admin", "superadmin"]',
    '["superadmin"]'
  );

  result = replaceAll(
    result,
    "['superadmin', 'super_admin']",
    "['superadmin']"
  );

  result = replaceAll(
    result,
    "['super_admin', 'superadmin']",
    "['superadmin']"
  );

  /*
   * Common includes() expressions.
   */

  result = replaceAll(
    result,
    '["superadmin", "super_admin"].includes',
    '["superadmin"].includes'
  );

  result = replaceAll(
    result,
    '["super_admin", "superadmin"].includes',
    '["superadmin"].includes'
  );

  /*
   * Set declarations.
   */

  result = replaceAll(
    result,
    'new Set(["superadmin", "super_admin"])',
    'new Set(["superadmin"])'
  );

  result = replaceAll(
    result,
    'new Set(["super_admin", "superadmin"])',
    'new Set(["superadmin"])'
  );

  /*
   * MongoDB $in arrays.
   */

  result = replaceAll(
    result,
    '$in: ["superadmin", "super_admin"]',
    '$in: ["superadmin"]'
  );

  result = replaceAll(
    result,
    '$in: ["super_admin", "superadmin"]',
    '$in: ["superadmin"]'
  );

  return result;
}

function repairRoleUtils(file, content) {
  if (!file.endsWith("server/utils/roleUtils.js")) {
    return content;
  }

  let result = content;

  /*
   * Preserve compatibility mapping:
   *
   * super_admin -> superadmin
   *
   * This is intentional.
   */

  if (
    !result.includes("super_admin: \"superadmin\"") &&
    !result.includes("super_admin: 'superadmin'")
  ) {
    warnings.push(
      `${relative(file)}: roleUtils compatibility mapping was not found.`
    );
  }

  return result;
}

function repairAuthMiddleware(file, content) {
  if (!file.endsWith("server/middleware/authMiddleware.js")) {
    return content;
  }

  let result = content;

  result = result.replace(
    /superAdminOnly\s*=\s*requireRoles\(\s*["']super_admin["']\s*\)/g,
    'superAdminOnly = requireRoles("superadmin")'
  );

  result = result.replace(
    /superAdminOnly\s*=\s*requireRoles\(\s*["']superadmin["']\s*,\s*["']super_admin["']\s*\)/g,
    'superAdminOnly = requireRoles("superadmin")'
  );

  return result;
}

function repairRoleMiddleware(file, content) {
  if (!file.endsWith("server/middleware/roleMiddleware.js")) {
    return content;
  }

  let result = content;

  result = result.replace(
    /roleMiddleware\(\s*["']super_admin["']\s*\)/g,
    'roleMiddleware("superadmin")'
  );

  return result;
}

function repairTenantMiddleware(file, content) {
  if (!file.endsWith("server/middleware/tenantMiddleware.js")) {
    return content;
  }

  /*
   * Tenant middleware MUST recognize canonical SuperAdmin.
   *
   * Do not remove the ability to recognize legacy values here
   * unless role normalization is guaranteed before this middleware.
   */

  let result = content;

  if (
    !result.includes('"superadmin"') &&
    !result.includes("'superadmin'")
  ) {
    warnings.push(
      `${relative(file)}: tenant middleware does not visibly contain superadmin.`
    );
  }

  return result;
}

function repairPermissionMiddleware(file, content) {
  if (!file.endsWith("server/middleware/permissionMiddleware.js")) {
    return content;
  }

  let result = content;

  /*
   * Prefer roleUtils/isSuperAdmin when already available.
   * We do not blindly inject imports because project import
   * conventions vary.
   */

  if (
    result.includes('"super_admin"') ||
    result.includes("'super_admin'")
  ) {
    warnings.push(
      `${relative(file)}: legacy super_admin reference remains; review manually.`
    );
  }

  return result;
}

function inspectSecurityPatterns(file, content) {
  const rel = relative(file);

  /*
   * Flag dangerous authorization patterns.
   */

  if (
    /role\s*===\s*["']superadmin["']/.test(content) &&
    !content.includes("roleUtils")
  ) {
    warnings.push(
      `${rel}: direct SuperAdmin role comparison found.`
    );
  }

  if (
    /role\s*===\s*["']super_admin["']/.test(content)
  ) {
    warnings.push(
      `${rel}: direct legacy super_admin comparison found.`
    );
  }

  if (
    /role\s*=\s*["']superadmin["']/.test(content) &&
    /req\.body/.test(content)
  ) {
    warnings.push(
      `${rel}: possible user-controlled SuperAdmin role assignment.`
    );
  }

  if (
    /role\s*:\s*req\.body\.role/.test(content)
  ) {
    warnings.push(
      `${rel}: request body may directly control user role.`
    );
  }

  if (
    /role\s*:\s*["']superadmin["']/.test(content) &&
    /User\.create/.test(content)
  ) {
    changes.push(
      `REVIEW: ${rel} creates a SuperAdmin directly.`
    );
  }
}

function applyFixes() {
  const files = walk(ROOT_DIR);

  log(`Active source files discovered: ${files.length}`);
  log("");

  if (!DRY_RUN) {
    ensureBackupDirectory();
  }

  for (const file of files) {
    let original;

    try {
      original = fs.readFileSync(file, "utf8");
    } catch (error) {
      errors.push(
        `${relative(file)}: unable to read: ${error.message}`
      );
      continue;
    }

    let updated = original;

    updated = normalizeSuperAdminChecks(updated);
    updated = repairRoleUtils(file, updated);
    updated = repairAuthMiddleware(file, updated);
    updated = repairRoleMiddleware(file, updated);
    updated = repairTenantMiddleware(file, updated);
    updated = repairPermissionMiddleware(file, updated);

    inspectSecurityPatterns(file, updated);

    if (updated !== original) {
      changes.push(
        `MODIFIED: ${relative(file)}`
      );

      if (!DRY_RUN) {
        try {
          backupFile(file);
          fs.writeFileSync(file, updated, "utf8");
        } catch (error) {
          errors.push(
            `${relative(file)}: unable to write: ${error.message}`
          );
        }
      }
    }
  }

  return files;
}

function auditRoleReferences(files) {
  const report = [];

  report.push("");
  report.push("==============================================");
  report.push("SUPERADMIN ROLE REFERENCE AUDIT");
  report.push("==============================================");
  report.push("");

  let canonical = 0;
  let legacy = 0;

  for (const file of files) {
    let content;

    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }

    const canonicalMatches =
      content.match(/\bsuperadmin\b/g) || [];

    const legacyMatches =
      content.match(/\bsuper_admin\b/g) || [];

    if (canonicalMatches.length) {
      canonical += canonicalMatches.length;
    }

    if (legacyMatches.length) {
      legacy += legacyMatches.length;

      report.push(
        `${relative(file)} -> legacy references: ${legacyMatches.length}`
      );
    }
  }

  report.push("");
  report.push(`Canonical superadmin references: ${canonical}`);
  report.push(`Legacy super_admin references: ${legacy}`);

  return report;
}

function auditBootstrapFiles(files) {
  const report = [];

  report.push("");
  report.push("==============================================");
  report.push("SUPERADMIN BOOTSTRAP / CREATION AUDIT");
  report.push("==============================================");
  report.push("");

  const suspicious = files.filter((file) => {
    const name = path.basename(file).toLowerCase();

    return (
      name.includes("superadmin") ||
      name.includes("onboarding") ||
      name.includes("userseed") ||
      name.includes("repair_rbac")
    );
  });

  for (const file of suspicious) {
    report.push(relative(file));
  }

  report.push("");
  report.push(
    `Potential bootstrap/repair files: ${suspicious.length}`
  );

  report.push("");
  report.push(
    "IMPORTANT: Only one permanent platform bootstrap path should create the initial SuperAdmin."
  );

  return report;
}

function runSyntaxChecks(files) {
  const report = [];

  report.push("");
  report.push("==============================================");
  report.push("JAVASCRIPT SYNTAX CHECK");
  report.push("==============================================");
  report.push("");

  let checked = 0;
  let failed = 0;

  for (const file of files) {
    if (!file.endsWith(".js")) continue;

    checked++;

    try {
      execSync(
        `node --check ${JSON.stringify(file)}`,
        {
          stdio: "pipe",
          cwd: ROOT_DIR,
        }
      );
    } catch (error) {
      failed++;

      report.push(
        `FAIL: ${relative(file)}`
      );

      const stderr =
        error.stderr?.toString()?.trim() || "";

      if (stderr) {
        report.push(stderr);
      }
    }
  }

  report.push("");
  report.push(`Files checked: ${checked}`);
  report.push(`Syntax failures: ${failed}`);

  return report;
}

function runGitStatus() {
  try {
    return execSync(
      "git status --short",
      {
        cwd: ROOT_DIR,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }
    ).trim();
  } catch {
    return "Git status unavailable.";
  }
}

function main() {
  log("");
  log("==================================================");
  log(" COHERENT TOURS SUPERADMIN RBAC REPAIR");
  log("==================================================");
  log("");
  log(`Repository: ${ROOT_DIR}`);
  log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE REPAIR"}`);
  log("");

  if (!DRY_RUN) {
    log(`Backup directory: ${BACKUP_DIR}`);
  }

  const files = applyFixes();

  const report = [];

  report.push("COHERENT TOURS SUPERADMIN RBAC AUDIT");
  report.push("=====================================");
  report.push(`Date: ${new Date().toISOString()}`);
  report.push(`Repository: ${ROOT_DIR}`);
  report.push(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE REPAIR"}`);
  report.push("");

  report.push("CHANGES");
  report.push("-------");

  if (!changes.length) {
    report.push("No automatic source changes were required.");
  } else {
    report.push(...changes);
  }

  report.push("");

  report.push("WARNINGS");
  report.push("--------");

  if (!warnings.length) {
    report.push("No automatic warnings.");
  } else {
    report.push(...warnings);
  }

  report.push("");

  report.push("ERRORS");
  report.push("------");

  if (!errors.length) {
    report.push("No errors.");
  } else {
    report.push(...errors);
  }

  report.push(...auditRoleReferences(files));
  report.push(...auditBootstrapFiles(files));

  if (!DRY_RUN) {
    report.push(...runSyntaxChecks(files));
  }

  report.push("");
  report.push("==============================================");
  report.push("GIT STATUS AFTER REPAIR");
  report.push("==============================================");
  report.push("");
  report.push(runGitStatus());

  if (!DRY_RUN) {
    writeReport(report);
  }

  log("");
  log("==================================================");
  log(" REPAIR COMPLETE");
  log("==================================================");
  log("");

  log(`Modified files: ${changes.filter(x =>
    x.startsWith("MODIFIED:")
  ).length}`);

  log(`Warnings: ${warnings.length}`);
  log(`Errors: ${errors.length}`);

  if (!DRY_RUN) {
    log("");
    log(`Backup: ${BACKUP_DIR}`);
    log(`Report: ${REPORT_FILE}`);
  }

  log("");

  if (errors.length) {
    process.exitCode = 2;
  }
}

main();
