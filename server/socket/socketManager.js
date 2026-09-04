import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/User.js";
import { getTenantId, isTenantBypassed, runWithTenant } from "../tenancy/context.js";

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
    let entry = onlineUsers.get(id);
    if (!entry) {
      entry = { tenantId: socket.tenantId, sockets: new Set() };
      onlineUsers.set(id, entry);
    }

    // A user id must never be associated with sockets from different tenant
    // contexts. Rejecting the connection prevents an accidental cross-tenant
    // delivery if stale/forged authentication data is ever encountered.
    if (String(entry.tenantId || "") !== String(socket.tenantId || "")) {
      socket.disconnect(true);
      return;
    }

    entry.sockets.add(socket.id);
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
      const current = onlineUsers.get(id);
      if (!current) return;
      current.sockets.delete(socket.id);
      if (current.sockets.size === 0) onlineUsers.delete(id);
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

  const entry = onlineUsers.get(userId.toString());
  if (!entry) return;

  const activeTenantId = getTenantId();
  const bypassed = isTenantBypassed();

  // Tenant-scoped callers may only deliver to sockets belonging to their own
  // tenant. Platform/super-admin jobs may intentionally deliver platform data.
  if (!bypassed && (!activeTenantId || String(entry.tenantId || "") !== String(activeTenantId))) return;

  entry.sockets.forEach((socketId) => io.to(socketId).emit(event, data));
};

export const broadcast = (event, data) => {
  if (!io || !isTenantBypassed()) return;
  io.emit(event, data);
};

export const emitToRoom = (room, event, data) => {
  if (!io || typeof room !== "string") return;

  const activeTenantId = getTenantId();
  const bypassed = isTenantBypassed();
  const tenantRoom = activeTenantId ? `tenant:${activeTenantId}` : null;
  const platformRoom = "tenant:platform";

  // Tenant callers may only emit to their own tenant room. Arbitrary room
  // broadcasts remain a platform-only capability.
  if (!bypassed && room !== tenantRoom) return;
  if (bypassed && !room.startsWith("tenant:") && room !== platformRoom) return;

  io.to(room).emit(event, data);
};
