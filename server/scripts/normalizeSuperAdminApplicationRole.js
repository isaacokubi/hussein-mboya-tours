import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

/*
 * scripts/normalizeSuperAdminApplicationRole.js
 *
 * This script is located at:
 *
 *   <repo>/server/scripts/
 *
 * Therefore:
 *
 *   SERVER_ROOT = <repo>/server
 *   PROJECT_ROOT = <repo>
 */

const SERVER_ROOT = path.resolve(SCRIPT_DIR, "..");
const PROJECT_ROOT = path.resolve(SERVER_ROOT, "..");

const TARGET_DIRS = [
  path.join(SERVER_ROOT),
  path.join(PROJECT_ROOT, "client"),
];

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

const EXCLUDED_FILES = new Set([
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.test",
]);

const EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
]);

const LEGACY_ROLE = "super_admin";
const CANONICAL_ROLE = "super_admin";

const timestamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

const backupRoot = path.join(
  SERVER_ROOT,
  "scripts",
  `superadmin-role-backups-${timestamp}`
);

let scannedFiles = 0;
let changedFiles = 0;
let changedOccurrences = 0;

function relativeProjectPath(filePath) {
  return path.relative(PROJECT_ROOT, filePath);
}

function shouldSkipDirectory(name) {
  return EXCLUDED_DIRS.has(name);
}

function shouldScanFile(filePath) {
  const basename = path.basename(filePath);

  if (EXCLUDED_FILES.has(basename)) {
    return false;
  }

  return EXTENSIONS.has(path.extname(filePath));
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!shouldSkipDirectory(entry.name)) {
        walk(
          path.join(dir, entry.name),
          files
        );
      }

      continue;
    }

    const filePath = path.join(dir, entry.name);

    if (shouldScanFile(filePath)) {
      files.push(filePath);
    }
  }

  return files;
}

function backupFile(filePath) {
  const relative = relativeProjectPath(filePath);

  const destination = path.join(
    backupRoot,
    relative
  );

  fs.mkdirSync(
    path.dirname(destination),
    { recursive: true }
  );

  fs.copyFileSync(
    filePath,
    destination
  );
}

function normalizeRoleReferences(source) {
  let result = source;
  let replacements = 0;

  /*
   * String role literals:
   *
   * "super_admin"
   * 'super_admin'
   * `super_admin`
   *
   * become:
   *
   * "super_admin"
   * 'super_admin'
   * `super_admin`
   */

  result = result.replace(
    /(["'])superadmin\1/g,
    (match, quote) => {
      replacements++;
      return `${quote}${CANONICAL_ROLE}${quote}`;
    }
  );

  result = result.replace(
    /(`)superadmin\1/g,
    (match, quote) => {
      replacements++;
      return `${quote}${CANONICAL_ROLE}${quote}`;
    }
  );

  /*
   * Bare role comparisons.
   */

  result = result.replace(
    /\b(role|user\.role|req\.user\.role|decoded\.role)\s*===\s*superadmin\b/g,
    (match, variable) => {
      replacements++;

      return `${variable} === "${CANONICAL_ROLE}"`;
    }
  );

  result = result.replace(
    /\bsuperadmin\s*===\s*(role|user\.role|req\.user\.role|decoded\.role)\b/g,
    (match, variable) => {
      replacements++;

      return `"${CANONICAL_ROLE}" === ${variable}`;
    }
  );

  /*
   * Common authorization checks.
   */

  result = result.replace(
    /\b(role|user\.role|req\.user\.role|decoded\.role)\s*!==\s*["']superadmin["']/g,
    (match, variable) => {
      replacements++;

      return `${variable} !== "${CANONICAL_ROLE}"`;
    }
  );

  result = result.replace(
    /\b(role|user\.role|req\.user\.role|decoded\.role)\s*==\s*["']superadmin["']/g,
    (match, variable) => {
      replacements++;

      return `${variable} == "${CANONICAL_ROLE}"`;
    }
  );

  return {
    result,
    replacements,
  };
}

function findRemainingLegacyReferences(files) {
  const matches = [];

  for (const filePath of files) {
    const source = fs.readFileSync(
      filePath,
      "utf8"
    );

    const lines = source.split(/\r?\n/);

    lines.forEach((line, index) => {
      if (
        /["'`]superadmin["'`]/.test(line) ||
        /\b(role|user\.role|req\.user\.role|decoded\.role)\s*(===|!==|==|!=)\s*superadmin\b/.test(
          line
        )
      ) {
        matches.push({
          file: relativeProjectPath(filePath),
          line: index + 1,
          text: line.trim(),
        });
      }
    });
  }

  return matches;
}

console.log(`
============================================================
 COHERENT TOURS
 SUPERADMIN APPLICATION ROLE NORMALIZATION
============================================================

Repository:
  ${PROJECT_ROOT}

Server:
  ${SERVER_ROOT}

Canonical role:
  ${CANONICAL_ROLE}

Legacy role:
  ${LEGACY_ROLE}

MongoDB:
  NOT MODIFIED

============================================================
`);

try {
  const files = [
    ...new Set(
      TARGET_DIRS.flatMap((dir) =>
        walk(dir)
      )
    ),
  ];

  console.log(
    `Files discovered: ${files.length}`
  );

  if (files.length === 0) {
    throw new Error(
      "ZERO FILES DISCOVERED. Refusing to report a false healthy migration."
    );
  }

  console.log(`
------------------------------------------------------------
 STEP 1: BACKUP
------------------------------------------------------------
`);

  fs.mkdirSync(
    backupRoot,
    { recursive: true }
  );

  console.log(
    `Backup directory:\n${backupRoot}`
  );

  console.log(`
------------------------------------------------------------
 STEP 2: NORMALIZE ROLE REFERENCES
------------------------------------------------------------
`);

  for (const filePath of files) {
    scannedFiles++;

    const source = fs.readFileSync(
      filePath,
      "utf8"
    );

    const {
      result,
      replacements,
    } = normalizeRoleReferences(source);

    if (replacements === 0) {
      continue;
    }

    backupFile(filePath);

    fs.writeFileSync(
      filePath,
      result,
      "utf8"
    );

    changedFiles++;
    changedOccurrences += replacements;

    console.log(
      `FIXED: ${relativeProjectPath(filePath)} ` +
      `(${replacements} replacement${replacements === 1 ? "" : "s"})`
    );
  }

  console.log(`
------------------------------------------------------------
 STEP 3: POST-MIGRATION AUDIT
------------------------------------------------------------
`);

  const remaining =
    findRemainingLegacyReferences(files);

  if (remaining.length === 0) {
    console.log(
      "OK: no targeted legacy 'super_admin' references remain."
    );
  } else {
    console.log(
      `WARNING: ${remaining.length} legacy references remain.`
    );

    for (const match of remaining) {
      console.log(
        `  ${match.file}:${match.line}`
      );

      console.log(
        `    ${match.text}`
      );
    }
  }

  console.log(`
============================================================
 MIGRATION COMPLETE
============================================================

Files discovered:
  ${files.length}

Files scanned:
  ${scannedFiles}

Files changed:
  ${changedFiles}

Role references normalized:
  ${changedOccurrences}

Backup:
  ${backupRoot}

MongoDB:
  NOT MODIFIED

Canonical role:
  ${CANONICAL_ROLE}
============================================================
`);

  if (remaining.length > 0) {
    console.log(`
SUPERADMIN APPLICATION ROLE STATUS:
REVIEW REQUIRED

The remaining references were intentionally not modified.
`);
    process.exitCode = 1;
  } else {
    console.log(`
SUPERADMIN APPLICATION ROLE STATUS:
HEALTHY
`);
  }

} catch (error) {
  console.error(`
============================================================
 MIGRATION FAILED
============================================================

${error.message}
`);

  process.exitCode = 1;
}
