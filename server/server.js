import http from "http";
import mongoose from "mongoose";

import app from "./app.js";

import connectDatabase from "./config/database.js";

import env from "./config/env.js";

import { Server } from "socket.io";

import { initSocket } from "./socket/socketManager.js";

await connectDatabase();

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

server.listen(env.PORT, () => {

    console.log(
        `Server running on port ${env.PORT}`
    );

});const shutdown = async () => {

    console.log("Closing server...");

    server.close(async () => {

        await mongoose.connection.close();

        console.log("Server stopped");

        process.exit(0);

    });

};

process.on("SIGINT", shutdown);

process.on("SIGTERM", shutdown);