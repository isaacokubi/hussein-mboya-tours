import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const CONFIRM = process.env.CONFIRM_DEMO_PASSWORD_RESET;
const DEMO_PASSWORD = String(process.env.SEED_DEMO_PASSWORD || "");

const DEMO_EMAIL_PATTERN = /@demo\.globaltours\.test$/i;

function validatePassword(password) {
  if (password.length < 8) {
    throw new Error("SEED_DEMO_PASSWORD must be at least 8 characters.");
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error(
      "SEED_DEMO_PASSWORD must contain at least one uppercase letter."
    );
  }

  if (!/[0-9]/.test(password)) {
    throw new Error(
      "SEED_DEMO_PASSWORD must contain at least one number."
    );
  }
}

async function main() {
  if (CONFIRM !== "YES") {
    throw new Error(
      "Refusing password reset. Set CONFIRM_DEMO_PASSWORD_RESET=YES."
    );
  }

  validatePassword(DEMO_PASSWORD);

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 1,
  });

  try {
    const db = mongoose.connection.db;
    const users = db.collection("users");

    const allDemoUsers = await users
      .find(
        {
          email: { $regex: DEMO_EMAIL_PATTERN },
        },
        {
          projection: {
            _id: 1,
            email: 1,
            role: 1,
            tenantId: 1,
            status: 1,
          },
        }
      )
      .sort({ email: 1 })
      .toArray();

    console.log(`All demo-domain accounts: ${allDemoUsers.length}`);

    if (allDemoUsers.length !== 18) {
      throw new Error(
        `Safety check failed: expected exactly 18 demo-domain accounts, found ${allDemoUsers.length}. No changes made.`
      );
    }

    const demoUsers = allDemoUsers.filter(
      (user) =>
        user.tenantId !== null &&
        user.tenantId !== undefined &&
        [
          "admin",
          "agent",
          "customer",
          "driver",
          "guide",
          "tour_manager",
        ].includes(user.role)
    );

    console.log("\n=== DEMO PASSWORD RESET PRECHECK ===");
    console.log(`Matching demo accounts: ${demoUsers.length}`);

    if (demoUsers.length !== 18) {
      throw new Error(
        `Safety check failed: expected exactly 18 demo accounts, found ${demoUsers.length}. No changes made.`
      );
    }

    const uniqueEmails = new Set(demoUsers.map((user) => user.email));
    const uniqueTenants = new Set(
      demoUsers.map((user) => String(user.tenantId))
    );

    if (uniqueEmails.size !== 18) {
      throw new Error(
        "Safety check failed: duplicate demo email addresses detected. No changes made."
      );
    }

    if (uniqueTenants.size !== 3) {
      throw new Error(
        `Safety check failed: expected exactly 3 tenant IDs, found ${uniqueTenants.size}. No changes made.`
      );
    }

    const inactive = demoUsers.filter(
      (user) => user.status !== "active"
    );

    if (inactive.length > 0) {
      throw new Error(
        `Safety check failed: ${inactive.length} demo accounts are not active. No changes made.`
      );
    }

    const roles = {};

    for (const user of demoUsers) {
      roles[user.role] = (roles[user.role] || 0) + 1;
    }

    const expectedRoles = {
      admin: 3,
      agent: 3,
      customer: 3,
      driver: 3,
      guide: 3,
      tour_manager: 3,
    };

    for (const [role, expected] of Object.entries(expectedRoles)) {
      if (roles[role] !== expected) {
        throw new Error(
          `Safety check failed: expected ${expected} ${role} accounts, found ${roles[role] || 0}. No changes made.`
        );
      }
    }

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    const result = await users.updateMany(
      {
        _id: { $in: demoUsers.map((user) => user._id) },
        email: { $regex: DEMO_EMAIL_PATTERN },
        tenantId: { $exists: true, $ne: null },
        role: {
          $in: [
            "admin",
            "agent",
            "customer",
            "driver",
            "guide",
            "tour_manager",
          ],
        },
      },
      {
        $set: {
          password: passwordHash,
          loginAttempts: 0,
          lockUntil: null,
        },
      }
    );

    if (result.matchedCount !== 18 || result.modifiedCount !== 18) {
      throw new Error(
        `Safety verification failed: matched=${result.matchedCount}, modified=${result.modifiedCount}.`
      );
    }

    console.log("\n=== DEMO PASSWORD RESET COMPLETE ===");
    console.log(`Matched accounts: ${result.matchedCount}`);
    console.log(`Updated accounts: ${result.modifiedCount}`);
    console.log("Password hashes regenerated: 18");
    console.log("Failed-login counters reset: 18");
    console.log("Platform super-admin untouched.");
    console.log("Tenant data untouched.");
    console.log("Bookings/tours/finance data untouched.");

    console.log("\nAffected accounts:");

    for (const user of demoUsers) {
      console.log(`- ${user.email}`);
    }

    console.log("\nPASSWORD RESET SUCCESSFUL.");
    console.log("No plaintext password was printed.");
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

main().catch((error) => {
  console.error("\nDEMO PASSWORD RESET FAILED:");
  console.error(error.message);
  process.exitCode = 1;
});
