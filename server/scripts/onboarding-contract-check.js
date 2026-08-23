import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(here, "..");
const read = (relativePath) => fs.readFileSync(path.join(serverRoot, relativePath), "utf8");

const onboarding = read("services/onboardingService.js");
const auth = read("controllers/authController.js");
const tenant = read("controllers/tenantController.js");
const adminUsers = read("controllers/adminUserController.js");
const bootstrap = read("scripts/bootstrapFirstSuperAdmin.js");

const assertions = [
  ["bootstrap refuses a second SuperAdmin", /Initial SuperAdmin already exists\. Bootstrap is permanently closed\./.test(onboarding)],
  ["SuperAdmin role is seeded as a system role", /name: \"(?:super_admin|superadmin)\"/.test(onboarding) && /level: 1000/.test(onboarding)],
  ["Admin role is seeded with permissions", /name: \"admin\"/.test(onboarding) && /ADMIN_PERMISSION_NAMES\.map/.test(onboarding)],
  ["first Admin is created inside tenant context", /runWithTenant\(\{ tenantId: organization\._id/.test(onboarding)],
  ["public registration creates customer only", /role: \"customer\"/.test(auth) && !/req\.body.*role/.test(auth)],
  ["tenant creation uses the system Admin role", /roles\.admin\._id/.test(tenant)],
  ["staff creation requires tenant context", /Select a company before creating a staff account/.test(adminUsers)],
  ["SuperAdmin cannot be created through staff API", /SuperAdmin accounts can only be created through the one-time platform bootstrap process/.test(adminUsers)],
  ["bootstrap command does not require passwords in CLI arguments", /askSecret/.test(bootstrap)],
];

const failures = assertions.filter(([, passed]) => !passed);
if (failures.length) {
  for (const [name] of failures) console.error(`FAIL onboarding contract: ${name}`);
  console.error(`Onboarding contract check failed with ${failures.length} failure(s).`);
  process.exit(1);
}

console.log(`Onboarding contract check passed (${assertions.length} assertions).`);
