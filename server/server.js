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

const DB_READY = 1;
const TASK_RETRY_MS = 60 * 1000;
const taskState = new Map();

const runNonCriticalTask = async (name, task) => {
  if (mongoose.connection.readyState !== DB_READY) return false;

  const state = taskState.get(name) || { running: false, failures: 0 };
  if (state.running) return false;
  state.running = true;
  taskState.set(name, state);

  try {
    await task();
    state.failures = 0;
    return true;
  } catch (error) {
    state.failures = Math.min(state.failures + 1, 8);
    const retryIn = Math.min(TASK_RETRY_MS * 2 ** Math.min(state.failures - 1, 4), 15 * 60 * 1000);
    console.error(`${name} unavailable; retrying on scheduler (next run <= ${Math.round(retryIn / 1000)}s):`, error.message);
    return false;
  } finally {
    state.running = false;
  }
};

await connectDatabase();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (env.CLIENT_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean),
    credentials: true,
  },
});
initSocket(io);
export { io };

const subscriptionInterval = startTenantSubscriptionScheduler();
const communicationInterval = startCustomerCommunicationScheduler();
const stopJobWorker = startJobWorker();
const retentionScheduler = startDataRetentionScheduler();

const runEtimsDispatcher = () => runNonCriticalTask("eTIMS dispatcher", enqueueDueEtimsInvoices);
const runLifecycleSync = () => runNonCriticalTask("Tour lifecycle sync", syncTourLifecycle);

const etimsInterval = setInterval(runEtimsDispatcher, TASK_RETRY_MS);
const lifecycleInterval = setInterval(runLifecycleSync, TASK_RETRY_MS);

server.on("error", (error) => {
  if (error?.code === "EADDRINUSE") {
    console.error(`PORT ${env.PORT} is already in use. Stop the existing server before starting another instance.`);
    console.error(`Find it with: sudo lsof -i :${env.PORT} -nP`);
    console.error(`Then stop the matching Node process, for example: kill <PID>`);
    void shutdown(1);
    return;
  }
  console.error("HTTP server error:", error);
  void shutdown(1);
});

const shutdown = async (exitCode = 0) => {
  clearInterval(lifecycleInterval);
  clearInterval(subscriptionInterval);
  clearInterval(communicationInterval);
  clearInterval(etimsInterval);
  clearInterval(retentionScheduler.interval);
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
};

server.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
  void runEtimsDispatcher();
  void runLifecycleSync();
  void retentionScheduler.run();
  startPaymentCleanupScheduler();
});

process.on("SIGINT", () => void shutdown(0));
process.on("SIGTERM", () => void shutdown(0));
