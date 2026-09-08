import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/User.js";
import { runWithTenant } from "../tenancy/context.js";

let io = null;
const onlineUsers = new Map();

const normalizeRole = (value) => String(value || "").trim().toLowerCase().replace(/[\s_-]/g, "");

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

      const role = normalizeRole(decoded.role);
      const tenantId = decoded.tenantId ? String(decoded.tenantId) : null;
      if (role !== "super_admin" && !tenantId) return next(new Error("Authentication tenant is required"));

      const loadUser = () => User.findById(decoded.sub).select("_id status role tenantId");
      const user = role === "super_admin"
        ? await runWithTenant({ bypass: true }, loadUser)
        : await runWithTenant({ tenantId, bypass: false }, loadUser);

      if (!user || user.status !== "active") return next(new Error("Account inactive or unavailable"));
      if (role !== "super_admin" && String(user.tenantId || "") !== tenantId) return next(new Error("Authentication tenant mismatch"));

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.tenantId = user.tenantId ? user.tenantId.toString() : null;
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

    socket.join(`tenant:${socket.tenantId || "platform"}`);

    socket.on("register", () => {});

    socket.on("join-room", (room) => {
      if (typeof room !== "string" || room.length > 100) return;
      if (room === `user:${id}`) socket.join(room);
      if (socket.tenantId && room === `tenant:${socket.tenantId}`) socket.join(room);
    });

    socket.on("leave-room", (room) => {
      if (room === `user:${id}` || (socket.tenantId && room === `tenant:${socket.tenantId}`)) socket.leave(room);
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

export const broadcast = (event, data) => {
  if (!io) return;
  io.emit(event, data);
};

export const emitToRoom = (room, event, data) => {
  if (!io) return;
  io.to(room).emit(event, data);
};
