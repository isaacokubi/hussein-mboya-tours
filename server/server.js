import "./tenancy/bootstrap.js";
import systemHealthRoutes from "./routes/systemHealthRoutes.js";
import databaseRoutes from "./routes/databaseRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import tenantSubscriptionRoutes from "./routes/tenantSubscriptionRoutes.js";
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
import mfaRoutes from "./routes/mfaRoutes.js";

await connectDatabase();
startPaymentCleanupScheduler();
const subscriptionInterval = startTenantSubscriptionScheduler();
await syncTourLifecycle().catch((error) => console.error("Initial tour lifecycle sync failed:", error));
const lifecycleInterval = setInterval(() => { syncTourLifecycle().catch((error) => console.error("Tour lifecycle sync failed:", error)); }, 60 * 1000);
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: (env.CLIENT_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean), credentials: true } });
initSocket(io);
export { io };
app.use("/api/settings", settingsRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/system", systemHealthRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/subscription", tenantSubscriptionRoutes);

const shutdown = async (exitCode = 0) => {
  clearInterval(lifecycleInterval);
  clearInterval(subscriptionInterval);
  try { await new Promise((resolve) => { if (!server.listening) return resolve(); server.close(() => resolve()); }); } catch (error) { console.error("Server shutdown error:", error.message); }
  try { await mongoose.connection.close(); } catch (error) { console.error("MongoDB shutdown error:", error.message); }
  process.exit(exitCode);
};
server.on("error", (error) => { if (error?.code === "EADDRINUSE") { console.error(`PORT ${env.PORT} is already in use. Stop the existing server before starting another instance.`); console.error(`Find it with: sudo lsof -i :${env.PORT} -nP`); console.error(`Then stop the matching Node process, for example: kill <PID>`); void shutdown(1); return; } console.error("HTTP server error:", error); void shutdown(1); });
server.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`));
process.on("SIGINT", () => void shutdown(0));
process.on("SIGTERM", () => void shutdown(0));
