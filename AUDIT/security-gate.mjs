#!/usr/bin/env node
/**
 * Lightweight release gate for the audited project.
 * This is intentionally static: CI should also run npm audit, tests and SAST.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checks = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", "dist", "build"].includes(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) checks.push(p);
  }
}
walk(root);

const text = Object.fromEntries(checks.map(p => [p, fs.readFileSync(p, "utf8")]));
const failures = [];

for (const [file, source] of Object.entries(text)) {
  if (file.includes(`${path.sep}server${path.sep}`) && /console\.log\([^\n]*(password|token|secret)/i.test(source)) {
    failures.push(`Potential secret logging: ${path.relative(root, file)}`);
  }
}

const required = [
  ["JWT issuer/audience verification", "jwt.verify(token, secret, {"],
  ["Socket JWT verification", "socket.handshake.auth?.token"],
  ["Upload nesting limit", "fieldNestingDepth: 5"],
];

for (const [name, needle] of required) {
  if (!Object.values(text).some(s => s.includes(needle))) failures.push(`Missing hardening control: ${name}`);
}

if (failures.length) {
  console.error("SECURITY GATE FAILED");
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log(`Security static gate passed across ${checks.length} JS/JSX files.`);
