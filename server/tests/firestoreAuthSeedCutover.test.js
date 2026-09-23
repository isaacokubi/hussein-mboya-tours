import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

test("Phase 10 auth uses Firestore model APIs instead of raw MongoDB connection APIs", () => {
  const source = read("controllers/authController.js");
  assert.doesNotMatch(source, /mongooseConnectionAvailable|User\.collection|User\?\.db|User\.hydrate/);
  assert.match(source, /runWithTenant\(/);
  assert.match(source, /User\.find\(\{ email, tenantId: \{ \$exists: true, \$ne: null \} \}\)/);
});

test("Phase 10 Firestore seed and repair scripts do not advertise MongoDB configuration", () => {
  const files = [
    "seeds/globalToursTestSeed.js",
    "seeds/repairGlobalTourMedia.js",
    "scripts/resetGlobalToursData.js",
    "seeds/customTourRequestsSeed.js",
    "seeds/dashboardOperationalSeed.js",
    "seeds/hospitalityDeveloperSeed.js",
    "seeds/ensureDashboardMasterData.js",
    "seeds/financialDashboardSeedRunner.js",
    "scripts/repairGlobalToursMedia.js",
    "scripts/reset-demo-passwords.js",
  ];
  for (const file of files) {
    const source = read(file);
    assert.match(source, /FIREBASE_PROJECT_ID/);
    assert.doesNotMatch(source, /MONGODB_URI is (missing|not configured|not defined)/);
  }
});
