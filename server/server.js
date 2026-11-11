/**
 * Purpose: server server application module. Main declarations: stopJobWorker, runNonCriticalTask, withTimeout, shutdown, startDatabaseServices.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "./tenancy/bootstrap.js";
// Load ./bootstrap/operationalAccountingHooks.js so this module can use its exported dependencies.
import "./bootstrap/operationalAccountingHooks.js";
// Load http so this module can use its exported dependencies.
import http from "http";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ./app.js so this module can use its exported dependencies.
import app from "./app.js";
// Load ./config/database.js so this module can use its exported dependencies.
import connectDatabase from "./config/database.js";
// Load ./config/env.js so this module can use its exported dependencies.
import env from "./config/env.js";
// Load socket.io so this module can use its exported dependencies.
import { Server } from "socket.io";
// Load ./socket/socketManager.js so this module can use its exported dependencies.
import { initSocket } from "./socket/socketManager.js";
// Load ./services/tourLifecycleService.js so this module can use its exported dependencies.
import { syncTourLifecycle } from "./services/tourLifecycleService.js";
// Load ./services/paymentCleanupScheduler.js so this module can use its exported dependencies.
import { startPaymentCleanupScheduler } from "./services/paymentCleanupScheduler.js";
// Load ./services/tenantSubscriptionService.js so this module can use its exported dependencies.
import { startTenantSubscriptionScheduler } from "./services/tenantSubscriptionService.js";
// Load ./services/customerCommunicationScheduler.js so this module can use its exported dependencies.
import { startCustomerCommunicationScheduler } from "./services/customerCommunicationScheduler.js";
// Load ./services/etimsService.js so this module can use its exported dependencies.
import { enqueueDueEtimsInvoices } from "./services/etimsService.js";
// Load ./services/jobWorkerService.js so this module can use its exported dependencies.
import { startJobWorker } from "./services/jobWorkerService.js";
// Load ./services/dataRetentionService.js so this module can use its exported dependencies.
import { startDataRetentionScheduler } from "./services/dataRetentionService.js";
// Load ./services/complianceExpiryService.js so this module can use its exported dependencies.
import { startComplianceExpiryScheduler } from "./services/complianceExpiryService.js";
// Load ./bootstrap/invoiceIndexMigration.js so this module can use its exported dependencies.
import { migrateInvoiceIndexes } from "./bootstrap/invoiceIndexMigration.js";
// Load ./startup/readiness.js so this module can use its exported dependencies.
import { setStartupPhase } from "./startup/readiness.js";
// Load ./scripts/stagingQaStartupSeed.js so this module can use its exported dependencies.
import { runStagingQaStartupSeed } from "./scripts/stagingQaStartupSeed.js";

// Declare DB_READY for use by the surrounding module or function.
const DB_READY = 1;
// Declare TASK_RETRY_MS for use by the surrounding module or function.
const TASK_RETRY_MS = 60 * 1000;
// Declare STARTUP_MIGRATION_TIMEOUT_MS for use by the surrounding module or function.
const STARTUP_MIGRATION_TIMEOUT_MS = Math.min(
  120_000,
  Math.max(1_000, Number(process.env.MONGODB_STARTUP_MIGRATION_TIMEOUT_MS) || 60_000),
);
// Declare STARTUP_RETRY_BASE_MS for use by the surrounding module or function.
const STARTUP_RETRY_BASE_MS = 2_000;
// Declare STARTUP_RETRY_MAX_MS for use by the surrounding module or function.
const STARTUP_RETRY_MAX_MS = 30_000;
// Declare taskState for use by the surrounding module or function.
const taskState = new Map();
// Declare intervals for use by the surrounding module or function.
const intervals = new Set();
// Declare stopJobWorker for use by the surrounding module or function.
let stopJobWorker = () => {};
// Declare shutdownPromise for use by the surrounding module or function.
let shutdownPromise = null;
// Declare shuttingDown for use by the surrounding module or function.
let shuttingDown = false;

// Declare runNonCriticalTask for use by the surrounding module or function.
const runNonCriticalTask = async (name, task) => {
  // Check the condition (mongoose.connection.readyState !== DB_READY) and run the matching branch.
  if (mongoose.connection.readyState !== DB_READY) return false;
  // Declare state for use by the surrounding module or function.
  const state = taskState.get(name) || { running: false, failures: 0 };
  // Check the condition (state.running) and run the matching branch.
  if (state.running) return false;
  // Perform the side effect or state update expressed on the following line.
  state.running = true;
  // Perform the side effect or state update expressed on the following line.
  taskState.set(name, state);
  // Run this operation with a dedicated error-handling path for failures.
  try { await task(); state.failures = 0; return true; }
  // Handle the error raised by the preceding protected operation.
  catch (error) { state.failures = Math.min(state.failures + 1, 8); const retryIn = Math.min(TASK_RETRY_MS * 2 ** Math.min(state.failures - 1, 4), 15 * 60 * 1000); console.error(`${name} unavailable; retrying on scheduler (next run <= ${Math.round(retryIn / 1000)}s):`, error.message); return false; }
  finally { state.running = false; }
};

// Declare withTimeout for use by the surrounding module or function.
const withTimeout = (task, timeoutMs, name) => {
  // Declare timer for use by the surrounding module or function.
  let timer;
  // Declare operation for use by the surrounding module or function.
  const operation = Promise.resolve().then(task);
  // Return the result of Promise.race([     operation,     new Promise((_, reject) => {       timer = setTimeout(() => reject(new Error(`${name} exceeded its ${timeoutMs}ms startup limit.`)), timeoutMs);       timer.unref?.();     }),   ]).catch(async (error) => {     if (error?.message === `${name} exceeded its ${timeoutMs}ms startup limit.`) {       // A timeout does not cancel MongoDB work. Let the in-flight migration       // settle before a retry so two index migrations cannot race each other.       await operation.catch(() => {});     }     throw error;   }).finally() to the caller.
  return Promise.race([
    operation,
    new Promise((_, reject) => {
      // Perform the side effect or state update expressed on the following line.
      timer = setTimeout(() => reject(new Error(`${name} exceeded its ${timeoutMs}ms startup limit.`)), timeoutMs);
      // Perform the side effect or state update expressed on the following line.
      timer.unref?.();
    }),
  ]).catch(async (error) => {
    // Check the condition (error?.message === `${name} exceeded its ${timeoutMs}ms startup limit.) and run the matching branch.
    if (error?.message === `${name} exceeded its ${timeoutMs}ms startup limit.`) {
      // A timeout does not cancel MongoDB work. Let the in-flight migration
      // settle before a retry so two index migrations cannot race each other.
      // Perform the side effect or state update expressed on the following line.
      await operation.catch(() => {});
    }
    // Stop the current operation by raising the value of error.
    throw error;
  }).finally(() => clearTimeout(timer));
};

// Declare server for use by the surrounding module or function.
const server = http.createServer(app);
// Declare io for use by the surrounding module or function.
const io = new Server(server, { cors: { origin: (env.CLIENT_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean), credentials: true } });
// Perform the side effect or state update expressed on the following line.
initSocket(io);
// Expose the selected declarations or re-exported members to other parts of the application.
export { io };

// Declare shutdown for use by the surrounding module or function.
const shutdown = (exitCode = 0) => {
  // Check the condition (shutdownPromise) and run the matching branch.
  if (shutdownPromise) return shutdownPromise;
  // Perform the side effect or state update expressed on the following line.
  shuttingDown = true;
  // Perform the side effect or state update expressed on the following line.
  shutdownPromise = (async () => {
    // Repeat the enclosed work for each required iteration.
    for (const interval of intervals) clearInterval(interval);
    // Perform the side effect or state update expressed on the following line.
    intervals.clear();
    // Perform the side effect or state update expressed on the following line.
    stopJobWorker();
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      await new Promise((resolve) => {
        // Check the condition (!server.listening) and run the matching branch.
        if (!server.listening) return resolve();
        // Perform the side effect or state update expressed on the following line.
        server.close(() => resolve());
      });
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      console.error("Server shutdown error:", error.message);
    }
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      await mongoose.connection.close();
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      console.error("MongoDB shutdown error:", error.message);
    }
    // Perform the side effect or state update expressed on the following line.
    process.exit(exitCode);
  })();
  // Return the value of shutdownPromise to the caller.
  return shutdownPromise;
};

// Declare startDatabaseServices for use by the surrounding module or function.
const startDatabaseServices = () => {
  // Perform the side effect or state update expressed on the following line.
  intervals.add(startTenantSubscriptionScheduler());
  // Perform the side effect or state update expressed on the following line.
  intervals.add(startCustomerCommunicationScheduler());
  // Perform the side effect or state update expressed on the following line.
  stopJobWorker = startJobWorker();
  // Declare retentionScheduler for use by the surrounding module or function.
  const retentionScheduler = startDataRetentionScheduler();
  // Perform the side effect or state update expressed on the following line.
  intervals.add(retentionScheduler.interval);
  // Declare complianceExpiryScheduler for use by the surrounding module or function.
  const complianceExpiryScheduler = startComplianceExpiryScheduler();
  // Perform the side effect or state update expressed on the following line.
  intervals.add(complianceExpiryScheduler.interval);

  // Declare runEtimsDispatcher for use by the surrounding module or function.
  const runEtimsDispatcher = () => runNonCriticalTask("eTIMS dispatcher", enqueueDueEtimsInvoices);
  // Declare runLifecycleSync for use by the surrounding module or function.
  const runLifecycleSync = () => runNonCriticalTask("Tour lifecycle sync", syncTourLifecycle);
  // Perform the side effect or state update expressed on the following line.
  intervals.add(setInterval(runEtimsDispatcher, TASK_RETRY_MS));
  // Perform the side effect or state update expressed on the following line.
  intervals.add(setInterval(runLifecycleSync, TASK_RETRY_MS));

  // Perform the side effect or state update expressed on the following line.
  void runEtimsDispatcher();
  // Perform the side effect or state update expressed on the following line.
  void runLifecycleSync();
  // Perform the side effect or state update expressed on the following line.
  void retentionScheduler.run();
  // Perform the side effect or state update expressed on the following line.
  void complianceExpiryScheduler.run();
  // Perform the side effect or state update expressed on the following line.
  startPaymentCleanupScheduler();
};

// Declare initializeDatabase for use by the surrounding module or function.
const initializeDatabase = async () => {
  // Declare failures for use by the surrounding module or function.
  let failures = 0;
  // Repeat the enclosed work for each required iteration.
  while (!shuttingDown) {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Check the condition (mongoose.connection.readyState !== 0) and run the matching branch.
      if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
      // Perform the side effect or state update expressed on the following line.
      setStartupPhase("starting");
      // Perform the side effect or state update expressed on the following line.
      await connectDatabase();
      // Perform the side effect or state update expressed on the following line.
      await runStagingQaStartupSeed();
      // Perform the side effect or state update expressed on the following line.
      await withTimeout(migrateInvoiceIndexes, STARTUP_MIGRATION_TIMEOUT_MS, "Invoice index migration");
      // Check the condition (shuttingDown) and run the matching branch.
      if (shuttingDown) return;
      // Perform the side effect or state update expressed on the following line.
      setStartupPhase("ready");
      // Perform the side effect or state update expressed on the following line.
      console.log("Critical database startup complete.");
      // Perform the side effect or state update expressed on the following line.
      startDatabaseServices();
      // Return the result to the caller.
      return;
    } catch (error) {
      // Check the condition (shuttingDown) and run the matching branch.
      if (shuttingDown) return;
      // Perform the side effect or state update expressed on the following line.
      failures += 1;
      // Perform the side effect or state update expressed on the following line.
      setStartupPhase("failed");
      // Declare retryIn for use by the surrounding module or function.
      const retryIn = Math.min(STARTUP_RETRY_BASE_MS * 2 ** Math.min(failures - 1, 5), STARTUP_RETRY_MAX_MS);
      // Perform the side effect or state update expressed on the following line.
      console.error("Critical database startup failed; HTTP listener remains available and initialization will retry:", error.name || "Error", error.code || "", `retryInMs=${retryIn}`);
      // Perform the side effect or state update expressed on the following line.
      await new Promise((resolve) => {
        // Declare timer for use by the surrounding module or function.
        const timer = setTimeout(resolve, retryIn);
        // Perform the side effect or state update expressed on the following line.
        timer.unref?.();
      });
    }
  }
};

// Perform the side effect or state update expressed on the following line.
server.on("error", (error) => {
  // Check the condition (error?.code === "EADDRINUSE") and run the matching branch.
  if (error?.code === "EADDRINUSE") { console.error(`PORT ${env.PORT} is already in use. Stop the existing server before starting another instance.`); void shutdown(1); return; }
  // Perform the side effect or state update expressed on the following line.
  console.error("HTTP server error:", error); void shutdown(1);
});

// Perform the side effect or state update expressed on the following line.
process.on("SIGINT", () => void shutdown(0));
// Perform the side effect or state update expressed on the following line.
process.on("SIGTERM", () => void shutdown(0));

// Perform the side effect or state update expressed on the following line.
server.listen(env.PORT, "0.0.0.0", () => {
  // Perform the side effect or state update expressed on the following line.
  console.log(`HTTP server listening on port ${server.address()?.port ?? env.PORT}`);
  // Perform the side effect or state update expressed on the following line.
  void initializeDatabase();
});
