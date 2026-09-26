import "../config/env.js";
import mongoose from "mongoose";
import {
  STAGING_SUPERADMIN_DATABASE_NAME,
  validateStagingSuperAdminBootstrapTarget,
} from "../config/mongoConfig.js";
import { bootstrapStagingSuperAdmin } from "../services/onboardingService.js";

const environment = process.env;
let connected = false;

try {
  // Recheck the fixed, command-specific target immediately before connecting.
  validateStagingSuperAdminBootstrapTarget({
    nodeEnv: environment.NODE_ENV,
    deploymentEnv: environment.DEPLOYMENT_ENV,
    stagingDatabaseName: environment.STAGING_DATABASE_NAME,
    uri: environment.MONGODB_URI,
  });

  for (const key of [
    "BOOTSTRAP_STAGING_SUPERADMIN_NAME",
    "BOOTSTRAP_STAGING_SUPERADMIN_EMAIL",
    "BOOTSTRAP_STAGING_SUPERADMIN_PHONE",
    "BOOTSTRAP_STAGING_SUPERADMIN_PASSWORD",
  ]) {
    if (!environment[key]) throw new Error(`Missing required environment variable: ${key}`);
  }

  await mongoose.connect(environment.MONGODB_URI);
  connected = true;
  if (mongoose.connection.db?.databaseName !== STAGING_SUPERADMIN_DATABASE_NAME) {
    await mongoose.disconnect();
    connected = false;
    throw new Error("Connected database identity could not be verified as the approved staging database.");
  }

  const result = await bootstrapStagingSuperAdmin({
    name: environment.BOOTSTRAP_STAGING_SUPERADMIN_NAME,
    email: environment.BOOTSTRAP_STAGING_SUPERADMIN_EMAIL,
    phone: environment.BOOTSTRAP_STAGING_SUPERADMIN_PHONE,
    password: environment.BOOTSTRAP_STAGING_SUPERADMIN_PASSWORD,
  });

  if (result.created) {
    console.log("Staging platform SuperAdmin created and verified with no tenant association.");
  } else {
    console.log("A staging platform SuperAdmin already exists; no account was created.");
  }
} catch {
  // Driver and validation errors can include connection strings or submitted fields.
  console.error("STAGING SUPERADMIN BOOTSTRAP FAILED. Review the command configuration without sharing secret values.");
  process.exitCode = 1;
} finally {
  if (connected) await mongoose.disconnect().catch(() => {});
}
