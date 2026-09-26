import crypto from "node:crypto";
import express from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { validateStagingSuperAdminBootstrapTarget } from "../../config/mongoConfig.js";
import User from "../../models/User.js";
import Role from "../../models/Role.js";
import Permission from "../../models/Permission.js";
import { bootstrapStagingSuperAdmin, ensureSystemRoles } from "../../services/onboardingService.js";

const REQUIRED_ENVIRONMENT = Object.freeze({
  NODE_ENV: "production",
  DEPLOYMENT_ENV: "staging",
  STAGING_DATABASE_NAME: "global_tours_test",
});

const tokenMatches = (supplied, expected) => {
  if (typeof supplied !== "string" || typeof expected !== "string") return false;
  const suppliedBytes = Buffer.from(supplied);
  const expectedBytes = Buffer.from(expected);
  return suppliedBytes.length === expectedBytes.length && suppliedBytes.length > 0
    && crypto.timingSafeEqual(suppliedBytes, expectedBytes);
};

const validRuntimeEnvironment = (environment) => Object.entries(REQUIRED_ENVIRONMENT)
  .every(([key, expected]) => String(environment[key] || "").trim() === expected);

const identityFromEnvironment = (environment) => ({
  name: environment.BOOTSTRAP_STAGING_SUPERADMIN_NAME,
  email: environment.BOOTSTRAP_STAGING_SUPERADMIN_EMAIL,
  phone: environment.BOOTSTRAP_STAGING_SUPERADMIN_PHONE,
  password: environment.BOOTSTRAP_STAGING_SUPERADMIN_PASSWORD,
});

/**
 * Temporary, guarded staging-only trigger. Remove this route after the staging
 * bootstrap, and remove STAGING_BOOTSTRAP_TRIGGER_TOKEN from the staging service.
 */
export function createStagingSuperAdminBootstrapRouter({
  environment = process.env,
  mongooseClient = mongoose,
  bootstrap = bootstrapStagingSuperAdmin,
  roleEnsurer = ensureSystemRoles,
  userSchema = User.schema,
  roleSchema = Role.schema,
  permissionSchema = Permission.schema,
} = {}) {
  const router = express.Router();
  const bootstrapLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "rate_limited" },
  });
  router.post("/bootstrap-superadmin", bootstrapLimiter, createStagingSuperAdminBootstrapHandler({
    environment, mongooseClient, bootstrap, roleEnsurer, userSchema, roleSchema, permissionSchema,
  }));

  return router;
}

export function createStagingSuperAdminBootstrapHandler({
  environment = process.env,
  mongooseClient = mongoose,
  bootstrap = bootstrapStagingSuperAdmin,
  roleEnsurer = ensureSystemRoles,
  userSchema = User.schema,
  roleSchema = Role.schema,
  permissionSchema = Permission.schema,
} = {}) {
  let completed = false;
  let running = false;

  return async (req, res) => {
    if (!validRuntimeEnvironment(environment)) return res.sendStatus(404);
    if (completed) return res.sendStatus(404);

    const expectedToken = environment.STAGING_BOOTSTRAP_TRIGGER_TOKEN;
    const suppliedToken = req.get("X-Staging-Bootstrap-Token");
    if (typeof expectedToken !== "string" || expectedToken.length < 32 || !tokenMatches(suppliedToken, expectedToken)) {
      return res.status(403).json({ success: false, error: "forbidden" });
    }
    if (running) return res.status(409).json({ success: false, error: "bootstrap_in_progress" });

    let connection;
    running = true;
    try {
      try {
        validateStagingSuperAdminBootstrapTarget({
          nodeEnv: environment.NODE_ENV,
          deploymentEnv: environment.DEPLOYMENT_ENV,
          stagingDatabaseName: environment.STAGING_DATABASE_NAME,
          uri: environment.MONGODB_URI,
        });
      } catch {
        return res.sendStatus(404);
      }

      for (const key of [
        "BOOTSTRAP_STAGING_SUPERADMIN_NAME",
        "BOOTSTRAP_STAGING_SUPERADMIN_EMAIL",
        "BOOTSTRAP_STAGING_SUPERADMIN_PHONE",
        "BOOTSTRAP_STAGING_SUPERADMIN_PASSWORD",
      ]) {
        if (!environment[key]) return res.sendStatus(404);
      }

      // Keep the API's shared connection open. This dedicated connection uses
      // the same validated staging URI and is always closed in finally.
      connection = mongooseClient.createConnection(environment.MONGODB_URI);
      await connection.asPromise();
      if (connection.db?.databaseName !== "global_tours_test") {
        return res.sendStatus(404);
      }

      const userModel = connection.model("User", userSchema);
      const roleModel = connection.model("Role", roleSchema);
      const permissionModel = connection.model("Permission", permissionSchema);
      const result = await bootstrap(identityFromEnvironment(environment), {
        userModel,
        ensureRoles: () => roleEnsurer({
          roleModel,
          permissionModel,
        }),
      });

      if (result?.created) {
        completed = true;
        return res.status(200).json({ success: true, created: true });
      }
      if (result?.created === false && result?.reason === "exists") {
        completed = true;
        return res.status(200).json({ success: true, created: false, reason: "exists" });
      }
      return res.status(500).json({ success: false, error: "bootstrap_failed" });
    } catch {
      // Never expose driver errors, validation details, request data, or secrets.
      return res.status(500).json({ success: false, error: "bootstrap_failed" });
    } finally {
      if (connection) await connection.close().catch(() => {});
      running = false;
    }
  };
}

const router = createStagingSuperAdminBootstrapRouter();
export default router;
