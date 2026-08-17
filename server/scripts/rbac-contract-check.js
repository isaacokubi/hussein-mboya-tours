import mongoose from "mongoose";
import User from "../models/User.js";
import { normalizeRole, hasAnyRole } from "../utils/roleUtils.js";

const cases = [
  ["super_admin", "superadmin"],
  ["superadmin", "superadmin"],
  ["tour_manager", "manager"],
  ["tourmanager", "manager"],
  ["travel_agent", "agent"],
  ["travelagent", "agent"],
  ["tour_guide", "guide"],
  ["tourguide", "guide"],
  ["driver", "driver"],
  ["customer", "customer"],
];

let failed = 0;

for (const [input, expected] of cases) {
  const actual = normalizeRole(input);
  if (actual !== expected) {
    failed += 1;
    console.error(`FAIL role normalization: ${input} -> ${actual}; expected ${expected}`);
  }
}

const hierarchyCases = [
  [{ role: "superadmin" }, ["admin", "manager", "agent", "guide", "driver"]],
  [{ role: "admin" }, ["manager", "agent", "guide", "driver"]],
  [{ role: "manager" }, ["manager"]],
  [{ role: "agent" }, ["agent"]],
  [{ role: "guide" }, ["guide"]],
  [{ role: "driver" }, ["driver"]],
  [{ role: "customer" }, ["customer"]],
];

for (const [user, roles] of hierarchyCases) {
  for (const role of roles) {
    if (!hasAnyRole(user, [role])) {
      failed += 1;
      console.error(`FAIL role access: ${user.role} should satisfy ${role}`);
    }
  }
}

if (failed) {
  console.error(`RBAC contract check failed with ${failed} failure(s).`);
  process.exit(1);
}

console.log("RBAC contract check passed.");
process.exit(0);
