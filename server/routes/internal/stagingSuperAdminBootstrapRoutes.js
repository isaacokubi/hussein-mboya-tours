import crypto from "node:crypto";
import express from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { validateStagingSuperAdminBootstrapTarget } from "../../config/mongoConfig.js";
import User from "../../models/User.js";
import { runWithTenant } from "../../tenancy/context.js";
import Customer from "../../models/Customer.js";
import Organization from "../../models/Organization.js";
import Tour from "../../models/Tour.js";
import Destination from "../../models/Destination.js";
import Booking from "../../models/Booking.js";
import Payment from "../../models/Payment.js";
import { runStagingQaSeedOnce, verifyStagingQaData } from "../../scripts/stagingQaSeedCore.js";

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

export function createStagingAdminRouter({
  environment = process.env,
  mongooseClient = mongoose,
  userSchema = User.schema,
  seed = runStagingQaSeedOnce,
  verify = verifyStagingQaData,
  models = { Organization, User, Customer, Destination, Tour, Booking, Payment },
} = {}) {
  const router = express.Router();
  const seedLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 3, standardHeaders: true, legacyHeaders: false, message: { success: false, error: "rate_limited" } });
  router.post("/seed-qa", seedLimiter, createStagingQaSeedHandler({ environment, mongooseClient, seed, models }));
  router.get("/verify-qa", seedLimiter, createStagingQaVerifyHandler({ environment, mongooseClient, verify, models }));
  const resetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "rate_limited" },
  });
  router.post("/reset-tenant-admin-password", resetLimiter, createStagingTenantAdminPasswordResetHandler({ environment, mongooseClient, userSchema }));

  return router;
}

export function createStagingQaSeedHandler({ environment = process.env, mongooseClient = mongoose, seed = seedStagingQaData, models = {} } = {}) {
  let completed = false;
  let running = false;
  return async (req, res) => {
    if (!validRuntimeEnvironment(environment)) return res.sendStatus(404);
    if (completed) return res.sendStatus(404);
    const expected = environment.STAGING_QA_SEED_TOKEN;
    if (typeof expected !== "string" || expected.length < 32 || !tokenMatches(req.get("X-Staging-QA-Seed-Token"), expected)) return res.status(403).json({ success: false, error: "forbidden" });
    if (running) return res.status(409).json({ success: false, error: "seed_in_progress" });
    running = true;
    try {
      const database = mongooseClient.connection?.db;
      if (database?.databaseName !== "global_tours_test") throw new Error("Connected database must be global_tours_test.");
      const result = await seed({ environment, mongooseClient, models });
      completed = true;
      return res.status(200).json({ success: true, ...result });
    } catch {
      return res.status(500).json({ success: false, error: "staging_qa_seed_failed" });
    } finally { running = false; }
  };
}

export function createStagingQaVerifyHandler({ environment = process.env, mongooseClient = mongoose, verify = verifyStagingQaData, models = {} } = {}) {
  return async (req, res) => {
    if (!validRuntimeEnvironment(environment)) return res.sendStatus(404);
    const expected = environment.STAGING_QA_SEED_TOKEN;
    if (typeof expected !== "string" || expected.length < 32 || !tokenMatches(req.get("X-Staging-QA-Seed-Token"), expected)) return res.status(403).json({ success: false, error: "forbidden" });
    try {
      const result = await verify({ environment, dbName: mongooseClient.connection?.db?.databaseName, models });
      return res.status(200).json({ success: true, ...result });
    } catch { return res.status(503).json({ success: false, error: "staging_qa_verification_failed" }); }
  };
}

const RESET_TARGET = Object.freeze({
  email: "staging-tenant-admin@example.com",
  tenantId: "6ab82dce30c1fd52b9dc3e80",
});

/** Temporary one-shot password reset for one disposable staging account. */
export function createStagingTenantAdminPasswordResetHandler({
  environment = process.env,
  mongooseClient = mongoose,
  userSchema = User.schema,
  objectIdFactory = (value) => new mongoose.Types.ObjectId(value),
} = {}) {
  let completed = false;
  let running = false;

  return async (req, res) => {
    if (!validRuntimeEnvironment(environment)) return res.sendStatus(404);
    if (completed) return res.sendStatus(404);

    const expectedToken = environment.STAGING_TENANT_ADMIN_RESET_TOKEN;
    if (typeof expectedToken !== "string" || expectedToken.length < 32
      || !tokenMatches(req.get("X-Staging-Tenant-Admin-Reset-Token"), expectedToken)) {
      return res.status(403).json({ success: false, error: "forbidden" });
    }
    if (running) return res.status(409).json({ success: false, error: "reset_in_progress" });

    const password = req.body?.password;
    if (typeof password !== "string" || password.length < 8 || password.length > 128
      || !/\d/.test(password) || !/[A-Z]/.test(password)) {
      return res.status(400).json({ success: false, error: "invalid_password" });
    }
    if (environment.STAGING_TENANT_ADMIN_EMAIL !== RESET_TARGET.email
      || environment.STAGING_TENANT_ADMIN_TENANT_ID !== RESET_TARGET.tenantId) return res.sendStatus(404);

    running = true;
    let connection;
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

      connection = mongooseClient.createConnection(environment.MONGODB_URI);
      await connection.asPromise();
      if (connection.db?.databaseName !== "global_tours_test" || connection.db?.databaseName === "husseindb") {
        return res.sendStatus(404);
      }

      const userModel = connection.model("User", userSchema);
      // Use the native collection only for the exact two-part identity lookup,
      // then save the hydrated document through Mongoose's normal hash hook.
      const rawUser = await userModel.collection.findOne({
        email: RESET_TARGET.email,
        tenantId: objectIdFactory(RESET_TARGET.tenantId),
      });
      if (!rawUser || rawUser.email !== RESET_TARGET.email
        || String(rawUser.tenantId) !== RESET_TARGET.tenantId) return res.sendStatus(404);

      const user = userModel.hydrate(rawUser);
      await runWithTenant({ tenantId: RESET_TARGET.tenantId, role: "admin", bypass: false }, async () => {
        user.password = password;
        user.passwordResetCodeHash = "";
        user.passwordResetExpiresAt = null;
        user.passwordResetAttempts = 0;
        user.loginPinHash = "";
        user.loginPinExpiresAt = null;
        user.loginPinAttempts = 0;
        user.loginPinLastSentAt = null;
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();
      });
      completed = true;
      return res.status(200).json({ success: true, reset: true });
    } catch {
      return res.status(500).json({ success: false, error: "reset_failed" });
    } finally {
      if (connection) await connection.close().catch(() => {});
      running = false;
    }
  };
}

const router = createStagingAdminRouter();
export default router;
