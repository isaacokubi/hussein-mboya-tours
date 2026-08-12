import systemHealthRoutes from "./routes/systemHealthRoutes.js";
import apiMonitorRoutes from "./routes/apiMonitorRoutes.js";
import databaseRoutes from "./routes/databaseRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import http from "http";
import mongoose from "mongoose";

import app from "./app.js";

import connectDatabase from "./config/database.js";

import env from "./config/env.js";

import { Server } from "socket.io";

import { initSocket } from "./socket/socketManager.js";
import { syncTourLifecycle } from "./services/tourLifecycleService.js";

await connectDatabase();

await syncTourLifecycle().catch((error) => {
    console.error("Initial tour lifecycle sync failed:", error);
});

const lifecycleInterval = setInterval(() => {
    syncTourLifecycle().catch((error) => {
        console.error("Tour lifecycle sync failed:", error);
    });
}, 60 * 1000);

const server = http.createServer(app);

const io = new Server(server, {

    cors: {

      origin: (env.CLIENT_ORIGINS || "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean),

        credentials: true
    }
});

initSocket(io);

export { io };

// SUPER ADMIN ROUTES
app.use("/api/security", securityRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/api-monitor", apiMonitorRoutes);
app.use("/api/system", systemHealthRoutes);

server.listen(env.PORT, () => {

    console.log(
        `Server running on port ${env.PORT}`
    );

});const shutdown = async () => {

    console.log("Closing server...");

    clearInterval(lifecycleInterval);

    server.close(async () => {

        await mongoose.connection.close();

        console.log("Server stopped");

        process.exit(0);

    });

};

process.on("SIGINT", shutdown);

process.on("SIGTERM", shutdown);
