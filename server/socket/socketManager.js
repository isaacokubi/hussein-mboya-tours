import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/User.js";
import { runWithTenant } from "../tenancy/context.js";

let io = null;
const onlineUsers = new Map();

export const initSocket = (socketServer) => {
    io = socketServer;

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");
            if (!token) return next(new Error("Authentication required"));

            const decoded = jwt.verify(token, env.JWT_SECRET, {
                issuer: "husseinmboyatours",
                audience: "husseinmboyatours-client",
            });
            const requestedTenantId = socket.handshake.auth?.tenantId ? String(socket.handshake.auth.tenantId) : null;
            const tokenTenantId = decoded.tenantId ? String(decoded.tenantId) : null;
            const isSuperAdmin = String(decoded.role || "").toLowerCase().replace(/[\s_-]/g, "") === "superadmin";

            const loadUser = () => User.findById(decoded.sub).select("_id status role tenantId");
            const user = isSuperAdmin
                ? await runWithTenant({ bypass: true }, loadUser)
                : await runWithTenant({ tenantId: tokenTenantId, bypass: false }, loadUser);

            if (!user || user.status !== "active") return next(new Error("Account inactive or unavailable"));
            if (!isSuperAdmin && (!user.tenantId || String(user.tenantId) !== tokenTenantId)) return next(new Error("Socket tenant mismatch"));
            if (!isSuperAdmin && requestedTenantId && requestedTenantId !== String(user.tenantId)) return next(new Error("Socket tenant mismatch"));

            socket.userId = user._id.toString();
            socket.userRole = user.role;
            socket.tenantId = requestedTenantId || tokenTenantId || (user.tenantId ? String(user.tenantId) : null);
            socket.isSuperAdmin = isSuperAdmin;
            next();
        } catch {
            next(new Error("Invalid socket authentication"));
        }
    });

    io.on("connection", (socket) => {
        const id = socket.userId;
        let sockets = onlineUsers.get(id);
        if (!sockets) {
            sockets = new Set();
            onlineUsers.set(id, sockets);
        }
        sockets.add(socket.id);

        if (socket.tenantId) socket.join(`tenant:${socket.tenantId}`);
        socket.join(`user:${id}`);

        socket.on("register", () => {});
        socket.on("join-room", (room) => {
            if (typeof room !== "string" || room.length > 100) return;
            if (room === `user:${id}` || (socket.tenantId && room === `tenant:${socket.tenantId}`)) socket.join(room);
        });
        socket.on("leave-room", (room) => {
            if (room === `user:${id}`) socket.leave(room);
            // Tenant rooms are intentionally not left by clients to prevent
            // accidental cross-tenant notification subscriptions.
        });
        socket.on("disconnect", () => {
            const sockets = onlineUsers.get(id);
            if (!sockets) return;
            sockets.delete(socket.id);
            if (sockets.size === 0) onlineUsers.delete(id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
};

export const sendNotificationToUser = (userId, event, data) => {
    if (!io) return;
    const sockets = onlineUsers.get(userId.toString());
    if (!sockets) return;
    sockets.forEach((socketId) => io.to(socketId).emit(event, data));
};

// Platform-level broadcast is retained for system events only. Tenant business
// events should use broadcastToTenant so one company cannot receive another's data.
export const broadcast = (event, data) => {
    if (!io) return;
    io.emit(event, data);
};

export const broadcastToTenant = (tenantId, event, data) => {
    if (!io || !tenantId) return;
    io.to(`tenant:${tenantId}`).emit(event, data);
};

export const emitToRoom = (room, event, data) => {
    if (!io) return;
    io.to(room).emit(event, data);
};
