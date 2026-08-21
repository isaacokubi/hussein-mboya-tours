import "./tenancy/bootstrap.js";
import systemHealthRoutes from "./routes/systemHealthRoutes.js";
import databaseRoutes from "./routes/databaseRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";

import http from "http";
import mongoose from "mongoose";

import app from "./app.js";

import connectDatabase from "./config/database.js";

import env from "./config/env.js";

import { Server } from "socket.io";

import { initSocket } from "./socket/socketManager.js";
import { syncTourLifecycle } from "./services/tourLifecycleService.js";
import { startPaymentCleanupScheduler } from "./services/paymentCleanupScheduler.js";
import mfaRoutes from "./routes/mfaRoutes.js";

await connectDatabase();

startPaymentCleanupScheduler();

await syncTourLifecycle().catch((error) => {
  console.error("Initial tour lifecycle sync failed:", error);
});

const lifecycleInterval = setInterval(() => {
  syncTourLifecycle().catch((error) => console.error("Tour lifecycle sync failed:", error));
}, 60 * 60 * 1000);

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.CLIENT_URL,
    credentials: true,
  },
});

initSocket(io);
app.set("io", io);

app.use("/api/system-health", systemHealthRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/mfa", mfaRoutes);

const port = env.PORT || 5000;
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  clearInterval(lifecycleInterval);
  httpServer.close(async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
