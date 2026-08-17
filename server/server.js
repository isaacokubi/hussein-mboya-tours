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

await connectDatabase();


startPaymentCleanupScheduler();


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

app.use("/api/settings", settingsRoutes);


app.use("/api/database", databaseRoutes);

app.use("/api/system", systemHealthRoutes);
app.use("/api/superadmin", superAdminRoutes);

server.listen(env.PORT, () => {

    console.log(
        `Server running on port ${env.PORT}`
    );

});const shutdown = async () => {

    // debug removed

    clearInterval(lifecycleInterval);

    server.close(async () => {

        await mongoose.connection.close();

        // debug removed

        process.exit(0);

    });

};

process.on("SIGINT", shutdown);

process.on("SIGTERM", shutdown);
