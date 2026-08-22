import fs from "node:fs";

const required = [
  ["server/routes/publicOnboardingRoutes.js", "/register"],
<<<<<<< HEAD
  ["server/controllers/publicOnboardingController.js", "bootstrapSuperAdmin"],
  ["server/services/publicOnboardingService.js", "bootstrapMatchesConfiguration"],
  ["server/services/publicOnboardingService.js", "BOOTSTRAP_SUPERADMIN_PASSWORD"],
  ["server/models/Subscription.js", "trialEndsAt"],
  ["client/src/pages/Register.jsx", "company=1"],
  ["client/src/pages/Register.jsx", "platformSetup=1"],
  ["client/src/pages/Register.jsx", "bootstrapSuperAdmin"],
=======
  ["server/controllers/publicOnboardingController.js", "registerTenantPublic"],
  ["server/services/publicOnboardingService.js", "registerTenant"],
  ["server/models/Subscription.js", "trialEndsAt"],
  ["client/src/pages/Register.jsx", "company=1"],
>>>>>>> feat/first-admin-superadmin-onboarding
];

let failed = false;
for (const [file, marker] of required) {
  const content = fs.readFileSync(file, "utf8");
<<<<<<< HEAD
  if (!content.includes(marker)) { console.error(`FAIL ${file}: missing ${marker}`); failed = true; }
  else console.log(`PASS ${file}: ${marker}`);
}
=======
  if (!content.includes(marker)) {
    console.error(`FAIL ${file}: missing ${marker}`);
    failed = true;
  } else {
    console.log(`PASS ${file}`);
  }
}

>>>>>>> feat/first-admin-superadmin-onboarding
if (failed) process.exit(1);
console.log("Public tenant onboarding contract check: PASS");
