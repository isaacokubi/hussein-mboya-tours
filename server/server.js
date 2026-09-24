import "./tenancy/bootstrap.js";
import "./bootstrap/operationalAccountingHooks.js";
import http from "http";
import mongoose from "mongoose";
import app from "./app.js";
import connectDatabase from "./config/database.js";
import env from "./config/env.js";
import { Server } from "socket.io";
import { initSocket } from "./socket/socketManager.js";
import { syncTourLifecycle } from "./services/tourLifecycleService.js";
import { startPaymentCleanupScheduler } from "./services/paymentCleanupScheduler.js";
import { startTenantSubscriptionScheduler } from "./services/tenantSubscriptionService.js";
import { startCustomerCommunicationScheduler } from "./services/customerCommunicationScheduler.js";
import { enqueueDueEtimsInvoices } from "./services/etimsService.js";
import { startJobWorker } from "./services/jobWorkerService.js";
import { startDataRetentionScheduler } from "./services/dataRetentionService.js";
import { startComplianceExpiryScheduler } from "./services/complianceExpiryService.js";
import { migrateInvoiceIndexes } from "./bootstrap/invoiceIndexMigration.js";
import { setStartupPhase } from "./startup/readiness.js";

const DB_READY = 1;
const TASK_RETRY_MS = 60 * 1000;
const STARTUP_MIGRATION_TIMEOUT_MS = Math.min(
  120_000,
  Math.max(1_000, Number(process.env.MONGODB_STARTUP_MIGRATION_TIMEOUT_MS) || 60_000),
);
const taskState = new Map();
const intervals = new Set();
let stopJobWorker = () => {};
let shutdownPromise = null;
let shuttingDown = false;

const runNonCriticalTask = async (name, task) => {
  if (mongoose.connection.readyState !== DB_READY) return false;
  const state = taskState.get(name) || { running: false, failures: 0 };
  if (state.running) return false;
  state.running = true;
  taskState.set(name, state);
  try { await task(); state.failures = 0; return true; }
  catch (error) { state.failures = Math.min(state.failures + 1, 8); const retryIn = Math.min(TASK_RETRY_MS * 2 ** Math.min(state.failures - 1, 4), 15 * 60 * 1000); console.error(`${name} unavailable; retrying on scheduler (next run <= ${Math.round(retryIn / 1000)}s):`, error.message); return false; }
  finally { state.running = false; }
};

const withTimeout = (task, timeoutMs, name) => {
  let timer;
  return Promise.race([
    Promise.resolve().then(task),
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${name} exceeded its ${timeoutMs}ms startup limit.`)), timeoutMs);
      timer.unref?.();
    }),
  ]).finally(() => clearTimeout(timer));
};

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: (env.CLIENT_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean), credentials: true } });
initSocket(io);
export { io };

const shutdown = (exitCode = 0) => {
  if (shutdownPromise) return shutdownPromise;
  shuttingDown = true;
  shutdownPromise = (async () => {
    for (const interval of intervals) clearInterval(interval);
    intervals.clear();
    stopJobWorker();
    try {
      await new Promise((resolve) => {
        if (!server.listening) return resolve();
        server.close(() => resolve());
      });
    } catch (error) {
      console.error("Server shutdown error:", error.message);
    }
    try {
      await mongoose.connection.close();
    } catch (error) {
      console.error("MongoDB shutdown error:", error.message);
    }
    process.exit(exitCode);
  })();
  return shutdownPromise;
};

const startDatabaseServices = () => {
  intervals.add(startTenantSubscriptionScheduler());
  intervals.add(startCustomerCommunicationScheduler());
  stopJobWorker = startJobWorker();
  const retentionScheduler = startDataRetentionScheduler();
  intervals.add(retentionScheduler.interval);
  const complianceExpiryScheduler = startComplianceExpiryScheduler();
  intervals.add(complianceExpiryScheduler.interval);

  const runEtimsDispatcher = () => runNonCriticalTask("eTIMS dispatcher", enqueueDueEtimsInvoices);
  const runLifecycleSync = () => runNonCriticalTask("Tour lifecycle sync", syncTourLifecycle);
  intervals.add(setInterval(runEtimsDispatcher, TASK_RETRY_MS));
  intervals.add(setInterval(runLifecycleSync, TASK_RETRY_MS));

  void runEtimsDispatcher();
  void runLifecycleSync();
  void retentionScheduler.run();
  void complianceExpiryScheduler.run();
  startPaymentCleanupScheduler();
};

const initializeDatabase = async () => {
  try {
    await connectDatabase();
    await withTimeout(migrateInvoiceIndexes, STARTUP_MIGRATION_TIMEOUT_MS, "Invoice index migration");
    if (shuttingDown) return;
    setStartupPhase("ready");
    console.log("Critical database startup complete.");
    startDatabaseServices();
  } catch (error) {
    if (shuttingDown) return;
    setStartupPhase("failed");
    console.error("Critical database startup failed:", error.name || "Error", error.code || "");
    void shutdown(1);
  }
};

server.on("error", (error) => {
  if (error?.code === "EADDRINUSE") { console.error(`PORT ${env.PORT} is already in use. Stop the existing server before starting another instance.`); void shutdown(1); return; }
  console.error("HTTP server error:", error); void shutdown(1);
});

process.on("SIGINT", () => void shutdown(0));
process.on("SIGTERM", () => void shutdown(0));

server.listen(env.PORT, () => {
  console.log(`HTTP server listening on port ${server.address()?.port ?? env.PORT}`);
  void initializeDatabase();
});
