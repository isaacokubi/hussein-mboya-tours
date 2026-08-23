import { normalizeRole, getUserRole, isAdmin, isManager, isAgent, isGuide, isDriver, isCustomer } from "../utils/roleUtils.js";

// Canonical platform role is `super_admin`.
// `superadmin` remains a supported legacy alias and must normalize to `super_admin`.
const normalizationCases = [
  ["super_admin", "super_admin"],
  ["superadmin", "super_admin"],
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
  ["super_admin", ["admin", "manager", "agent", "guide", "driver"]],
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
  const normalizedExpected = normalizeRole(role);

  if (getUserRole(user) !== normalizedExpected) {
    failed += 1;
    console.error(
      `FAIL user role resolution: ${role} -> ${getUserRole(user)}; expected ${normalizedExpected}`
    );
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
