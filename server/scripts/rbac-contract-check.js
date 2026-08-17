import { normalizeRole, getUserRole, isAdmin, isManager, isAgent, isGuide, isDriver, isCustomer } from "../utils/roleUtils.js";

const normalizationCases = [
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

const hierarchyCases = [
  ["superadmin", ["admin", "manager", "agent", "guide", "driver"]],
  ["admin", ["admin", "manager", "agent", "guide", "driver"]],
  ["manager", ["manager"]],
  ["agent", ["agent"]],
  ["guide", ["guide"]],
  ["driver", ["driver"]],
  ["customer", ["customer"]],
];

const helpers = {
  admin: isAdmin,
  manager: isManager,
  agent: isAgent,
  guide: isGuide,
  driver: isDriver,
  customer: isCustomer,
};

let failed = 0;

for (const [input, expected] of normalizationCases) {
  const actual = normalizeRole(input);
  if (actual !== expected) {
    failed += 1;
    console.error(`FAIL role normalization: ${input} -> ${actual}; expected ${expected}`);
  }
}

for (const [role, expectedRoles] of hierarchyCases) {
  const user = { role };
  if (getUserRole(user) !== role) {
    failed += 1;
    console.error(`FAIL user role resolution: ${role}`);
  }

  for (const expectedRole of expectedRoles) {
    const helper = helpers[expectedRole];
    if (!helper || !helper(user)) {
      failed += 1;
      console.error(`FAIL role access: ${role} should satisfy ${expectedRole}`);
    }
  }
}

if (failed) {
  console.error(`RBAC contract check failed with ${failed} failure(s).`);
  process.exit(1);
}

console.log("RBAC contract check passed.");
process.exit(0);
