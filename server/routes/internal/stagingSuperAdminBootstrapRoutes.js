/**
 * Purpose: staging Super Admin Bootstrap Routes API route module. Main declarations: tokenMatches, validRuntimeEnvironment, createStagingAdminRouter, createStagingQaSeedHandler, createStagingQaVerifyHandler.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import crypto from "node:crypto";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load express-rate-limit so this module can use its exported dependencies.
import rateLimit from "express-rate-limit";
// Load ../../config/mongoConfig.js so this module can use its exported dependencies.
import { validateStagingSuperAdminBootstrapTarget } from "../../config/mongoConfig.js";
// Load ../../models/User.js so this module can use its exported dependencies.
import User from "../../models/User.js";
// Load ../../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../../tenancy/context.js";
// Load ../../models/Customer.js so this module can use its exported dependencies.
import Customer from "../../models/Customer.js";
// Load ../../models/Organization.js so this module can use its exported dependencies.
import Organization from "../../models/Organization.js";
// Load ../../models/Tour.js so this module can use its exported dependencies.
import Tour from "../../models/Tour.js";
// Load ../../models/Destination.js so this module can use its exported dependencies.
import Destination from "../../models/Destination.js";
// Load ../../models/Booking.js so this module can use its exported dependencies.
import Booking from "../../models/Booking.js";
// Load ../../models/Payment.js so this module can use its exported dependencies.
import Payment from "../../models/Payment.js";
// Load ../../scripts/stagingQaSeedCore.js so this module can use its exported dependencies.
import { runStagingQaSeedOnce, verifyStagingQaData } from "../../scripts/stagingQaSeedCore.js";

// Declare REQUIRED_ENVIRONMENT for use by the surrounding module or function.
const REQUIRED_ENVIRONMENT = Object.freeze({
  NODE_ENV: "production",
  DEPLOYMENT_ENV: "staging",
  STAGING_DATABASE_NAME: "global_tours_test",
});

// Declare tokenMatches for use by the surrounding module or function.
const tokenMatches = (supplied, expected) => {
  // Check the condition (typeof supplied !== "string" || typeof expected !== "string") and run the matching branch.
  if (typeof supplied !== "string" || typeof expected !== "string") return false;
  // Declare suppliedBytes for use by the surrounding module or function.
  const suppliedBytes = Buffer.from(supplied);
  // Declare expectedBytes for use by the surrounding module or function.
  const expectedBytes = Buffer.from(expected);
  // Return the expression shown below to the caller.
  return suppliedBytes.length === expectedBytes.length && suppliedBytes.length > 0
    && crypto.timingSafeEqual(suppliedBytes, expectedBytes);
};

// Declare validRuntimeEnvironment for use by the surrounding module or function.
const validRuntimeEnvironment = (environment) => Object.entries(REQUIRED_ENVIRONMENT)
  .every(([key, expected]) => String(environment[key] || "").trim() === expected);

// Define createStagingAdminRouter; its parameters and body implement this operation.
export function createStagingAdminRouter({
  environment = process.env,
  mongooseClient = mongoose,
  userSchema = User.schema,
  seed = runStagingQaSeedOnce,
  verify = verifyStagingQaData,
  models = { Organization, User, Customer, Destination, Tour, Booking, Payment },
} = {}) {
  // Declare router for use by the surrounding module or function.
  const router = express.Router();
  // Declare seedLimiter for use by the surrounding module or function.
  const seedLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 3, standardHeaders: true, legacyHeaders: false, message: { success: false, error: "rate_limited" } });
  // Perform the side effect or state update expressed on the following line.
  router.post("/seed-qa", seedLimiter, createStagingQaSeedHandler({ environment, mongooseClient, seed, models }));
  // Perform the side effect or state update expressed on the following line.
  router.get("/verify-qa", seedLimiter, createStagingQaVerifyHandler({ environment, mongooseClient, verify, models }));
  // Declare resetLimiter for use by the surrounding module or function.
  const resetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "rate_limited" },
  });
  // Perform the side effect or state update expressed on the following line.
  router.post("/reset-tenant-admin-password", resetLimiter, createStagingTenantAdminPasswordResetHandler({ environment, mongooseClient, userSchema }));

  // Return the value of router to the caller.
  return router;
}

// Define createStagingQaSeedHandler; its parameters and body implement this operation.
export function createStagingQaSeedHandler({ environment = process.env, mongooseClient = mongoose, seed = seedStagingQaData, models = {} } = {}) {
  // Declare completed for use by the surrounding module or function.
  let completed = false;
  // Declare running for use by the surrounding module or function.
  let running = false;
  // Return the expression shown below to the caller.
  return async (req, res) => {
    // Check the condition (!validRuntimeEnvironment(environment)) and run the matching branch.
    if (!validRuntimeEnvironment(environment)) return res.sendStatus(404);
    // Check the condition (completed) and run the matching branch.
    if (completed) return res.sendStatus(404);
    // Declare expected for use by the surrounding module or function.
    const expected = environment.STAGING_QA_SEED_TOKEN;
    // Check the condition (typeof expected !== "string" || expected.length < 32 || !tokenMatches() and run the matching branch.
    if (typeof expected !== "string" || expected.length < 32 || !tokenMatches(req.get("X-Staging-QA-Seed-Token"), expected)) return res.status(403).json({ success: false, error: "forbidden" });
    // Check the condition (running) and run the matching branch.
    if (running) return res.status(409).json({ success: false, error: "seed_in_progress" });
    // Perform the side effect or state update expressed on the following line.
    running = true;
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare database for use by the surrounding module or function.
      const database = mongooseClient.connection?.db;
      // Check the condition (database?.databaseName !== "global_tours_test") and run the matching branch.
      if (database?.databaseName !== "global_tours_test") throw new Error("Connected database must be global_tours_test.");
      // Declare result for use by the surrounding module or function.
      const result = await seed({ environment, mongooseClient, models });
      // Perform the side effect or state update expressed on the following line.
      completed = true;
      // Return the result of res.status(200).json() to the caller.
      return res.status(200).json({ success: true, ...result });
    } catch {
      // Return the result of res.status(500).json() to the caller.
      return res.status(500).json({ success: false, error: "staging_qa_seed_failed" });
    } finally { running = false; }
  };
}

// Define createStagingQaVerifyHandler; its parameters and body implement this operation.
export function createStagingQaVerifyHandler({ environment = process.env, mongooseClient = mongoose, verify = verifyStagingQaData, models = {} } = {}) {
  // Return the expression shown below to the caller.
  return async (req, res) => {
    // Check the condition (!validRuntimeEnvironment(environment)) and run the matching branch.
    if (!validRuntimeEnvironment(environment)) return res.sendStatus(404);
    // Declare expected for use by the surrounding module or function.
    const expected = environment.STAGING_QA_SEED_TOKEN;
    // Check the condition (typeof expected !== "string" || expected.length < 32 || !tokenMatches() and run the matching branch.
    if (typeof expected !== "string" || expected.length < 32 || !tokenMatches(req.get("X-Staging-QA-Seed-Token"), expected)) return res.status(403).json({ success: false, error: "forbidden" });
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare result for use by the surrounding module or function.
      const result = await verify({ environment, dbName: mongooseClient.connection?.db?.databaseName, models });
      // Return the result of res.status(200).json() to the caller.
      return res.status(200).json({ success: true, ...result });
    } catch { return res.status(503).json({ success: false, error: "staging_qa_verification_failed" }); }
  };
}

// Declare RESET_TARGET for use by the surrounding module or function.
const RESET_TARGET = Object.freeze({
  email: "staging-tenant-admin@example.com",
  tenantId: "6ab82dce30c1fd52b9dc3e80",
});

/** Temporary one-shot password reset for one disposable staging account. */
// Define createStagingTenantAdminPasswordResetHandler; its parameters and body implement this operation.
export function createStagingTenantAdminPasswordResetHandler({
  environment = process.env,
  mongooseClient = mongoose,
  userSchema = User.schema,
  objectIdFactory = (value) => new mongoose.Types.ObjectId(value),
} = {}) {
  // Declare completed for use by the surrounding module or function.
  let completed = false;
  // Declare running for use by the surrounding module or function.
  let running = false;

  // Return the expression shown below to the caller.
  return async (req, res) => {
    // Check the condition (!validRuntimeEnvironment(environment)) and run the matching branch.
    if (!validRuntimeEnvironment(environment)) return res.sendStatus(404);
    // Check the condition (completed) and run the matching branch.
    if (completed) return res.sendStatus(404);

    // Declare expectedToken for use by the surrounding module or function.
    const expectedToken = environment.STAGING_TENANT_ADMIN_RESET_TOKEN;
    // Check the condition (typeof expectedToken !== "string" || expectedToken.length < 32 || !tok) and run the matching branch.
    if (typeof expectedToken !== "string" || expectedToken.length < 32
      || !tokenMatches(req.get("X-Staging-Tenant-Admin-Reset-Token"), expectedToken)) {
      // Return the result of res.status(403).json() to the caller.
      return res.status(403).json({ success: false, error: "forbidden" });
    }
    // Check the condition (running) and run the matching branch.
    if (running) return res.status(409).json({ success: false, error: "reset_in_progress" });

    // Declare password for use by the surrounding module or function.
    const password = req.body?.password;
    // Check the condition (typeof password !== "string" || password.length < 8 || password.length) and run the matching branch.
    if (typeof password !== "string" || password.length < 8 || password.length > 128
      || !/\d/.test(password) || !/[A-Z]/.test(password)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, error: "invalid_password" });
    }
    // Check the condition (environment.STAGING_TENANT_ADMIN_EMAIL !== RESET_TARGET.email || envir) and run the matching branch.
    if (environment.STAGING_TENANT_ADMIN_EMAIL !== RESET_TARGET.email
      || environment.STAGING_TENANT_ADMIN_TENANT_ID !== RESET_TARGET.tenantId) return res.sendStatus(404);

    // Perform the side effect or state update expressed on the following line.
    running = true;
    // Declare connection for use by the surrounding module or function.
    let connection;
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Run this operation with a dedicated error-handling path for failures.
      try {
        // Perform the side effect or state update expressed on the following line.
        validateStagingSuperAdminBootstrapTarget({
          nodeEnv: environment.NODE_ENV,
          deploymentEnv: environment.DEPLOYMENT_ENV,
          stagingDatabaseName: environment.STAGING_DATABASE_NAME,
          uri: environment.MONGODB_URI,
        });
      } catch {
        // Return the result of res.sendStatus() to the caller.
        return res.sendStatus(404);
      }

      // Perform the side effect or state update expressed on the following line.
      connection = mongooseClient.createConnection(environment.MONGODB_URI);
      // Perform the side effect or state update expressed on the following line.
      await connection.asPromise();
      // Check the condition (connection.db?.databaseName !== "global_tours_test" || connection.db?.) and run the matching branch.
      if (connection.db?.databaseName !== "global_tours_test" || connection.db?.databaseName === "husseindb") {
        // Return the result of res.sendStatus() to the caller.
        return res.sendStatus(404);
      }

      // Declare userModel for use by the surrounding module or function.
      const userModel = connection.model("User", userSchema);
      // Use the native collection only for the exact two-part identity lookup,
      // then save the hydrated document through Mongoose's normal hash hook.
      // Declare rawUser for use by the surrounding module or function.
      const rawUser = await userModel.collection.findOne({
        email: RESET_TARGET.email,
        tenantId: objectIdFactory(RESET_TARGET.tenantId),
      });
      // Check the condition (!rawUser || rawUser.email !== RESET_TARGET.email || String(rawUser.ten) and run the matching branch.
      if (!rawUser || rawUser.email !== RESET_TARGET.email
        || String(rawUser.tenantId) !== RESET_TARGET.tenantId) return res.sendStatus(404);

      // Declare user for use by the surrounding module or function.
      const user = userModel.hydrate(rawUser);
      // Perform the side effect or state update expressed on the following line.
      await runWithTenant({ tenantId: RESET_TARGET.tenantId, role: "admin", bypass: false }, async () => {
        // Perform the side effect or state update expressed on the following line.
        user.password = password;
        // Perform the side effect or state update expressed on the following line.
        user.passwordResetCodeHash = "";
        // Perform the side effect or state update expressed on the following line.
        user.passwordResetExpiresAt = null;
        // Perform the side effect or state update expressed on the following line.
        user.passwordResetAttempts = 0;
        // Perform the side effect or state update expressed on the following line.
        user.loginPinHash = "";
        // Perform the side effect or state update expressed on the following line.
        user.loginPinExpiresAt = null;
        // Perform the side effect or state update expressed on the following line.
        user.loginPinAttempts = 0;
        // Perform the side effect or state update expressed on the following line.
        user.loginPinLastSentAt = null;
        // Perform the side effect or state update expressed on the following line.
        user.loginAttempts = 0;
        // Perform the side effect or state update expressed on the following line.
        user.lockUntil = null;
        // Perform the side effect or state update expressed on the following line.
        await user.save();
      });
      // Perform the side effect or state update expressed on the following line.
      completed = true;
      // Return the result of res.status(200).json() to the caller.
      return res.status(200).json({ success: true, reset: true });
    } catch {
      // Return the result of res.status(500).json() to the caller.
      return res.status(500).json({ success: false, error: "reset_failed" });
    } finally {
      // Check the condition (connection) and run the matching branch.
      if (connection) await connection.close().catch(() => {});
      // Perform the side effect or state update expressed on the following line.
      running = false;
    }
  };
}

// Declare router for use by the surrounding module or function.
const router = createStagingAdminRouter();
export default router;
