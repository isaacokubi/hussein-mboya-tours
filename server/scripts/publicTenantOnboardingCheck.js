import fs from "node:fs";

const required = [
  ["routes/publicOnboardingRoutes.js", "/register"],
  ["controllers/publicOnboardingController.js", "registerTenantPublic"],
  ["services/publicOnboardingService.js", "registerTenant"],
  ["models/Subscription.js", "trialEndsAt"],
  ["../client/src/pages/Register.jsx", "company=1"],
];

let failed = false;
for (const [file, marker] of required) {
  const content = fs.readFileSync(file, "utf8");
  if (!content.includes(marker)) {
    console.error(`FAIL ${file}: missing ${marker}`);
    failed = true;
  } else {
    console.log(`PASS ${file}`);
  }
}

if (failed) process.exit(1);
console.log("Public tenant onboarding contract check: PASS");
