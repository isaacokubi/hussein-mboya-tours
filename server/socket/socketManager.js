/**
 * Purpose: socket Manager real-time socket module. Main declarations: normalizeRole, initSocket, loadUser, getIO, sendNotificationToUser.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import jwt from "jsonwebtoken";
// Load ../config/env.js so this module can use its exported dependencies.
import env from "../config/env.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Declare io for use by the surrounding module or function.
let io = null;
// Declare onlineUsers for use by the surrounding module or function.
const onlineUsers = new Map();

// Declare normalizeRole for use by the surrounding module or function.
const normalizeRole = (value) => String(value || "").trim().toLowerCase().replace(/[\s_-]/g, "");

// Declare initSocket for use by the surrounding module or function.
export const initSocket = (socketServer) => {
  // Perform the side effect or state update expressed on the following line.
  io = socketServer;

  // Perform the side effect or state update expressed on the following line.
  io.use(async (socket, next) => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare token for use by the surrounding module or function.
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");
      // Check the condition (!token) and run the matching branch.
      if (!token) return next(new Error("Authentication required"));

      // Declare decoded for use by the surrounding module or function.
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        issuer: "husseinmboyatours",
        audience: "husseinmboyatours-client",
      });

      // Declare role for use by the surrounding module or function.
      const role = normalizeRole(decoded.role);
      // Declare tenantId for use by the surrounding module or function.
      const tenantId = decoded.tenantId ? String(decoded.tenantId) : null;
      // Check the condition (role !== "super_admin" && !tenantId) and run the matching branch.
      if (role !== "super_admin" && !tenantId) return next(new Error("Authentication tenant is required"));

      // Declare loadUser for use by the surrounding module or function.
      const loadUser = () => User.findById(decoded.sub).select("_id status role tenantId");
      // Declare user for use by the surrounding module or function.
      const user = role === "super_admin"
        ? await runWithTenant({ bypass: true }, loadUser)
        : await runWithTenant({ tenantId, bypass: false }, loadUser);

      // Check the condition (!user || user.status !== "active") and run the matching branch.
      if (!user || user.status !== "active") return next(new Error("Account inactive or unavailable"));
      // Check the condition (role !== "super_admin" && String(user.tenantId || "") !== tenantId) and run the matching branch.
      if (role !== "super_admin" && String(user.tenantId || "") !== tenantId) return next(new Error("Authentication tenant mismatch"));

      // Perform the side effect or state update expressed on the following line.
      socket.userId = user._id.toString();
      // Perform the side effect or state update expressed on the following line.
      socket.userRole = user.role;
      // Perform the side effect or state update expressed on the following line.
      socket.tenantId = user.tenantId ? user.tenantId.toString() : null;
      // Perform the side effect or state update expressed on the following line.
      next();
    } catch {
      // Perform the side effect or state update expressed on the following line.
      next(new Error("Invalid socket authentication"));
    }
  });

  // Perform the side effect or state update expressed on the following line.
  io.on("connection", (socket) => {
    // Declare id for use by the surrounding module or function.
    const id = socket.userId;
    // Declare sockets for use by the surrounding module or function.
    let sockets = onlineUsers.get(id);
    // Check the condition (!sockets) and run the matching branch.
    if (!sockets) {
      // Perform the side effect or state update expressed on the following line.
      sockets = new Set();
      // Perform the side effect or state update expressed on the following line.
      onlineUsers.set(id, sockets);
    }
    // Perform the side effect or state update expressed on the following line.
    sockets.add(socket.id);

    // Perform the side effect or state update expressed on the following line.
    socket.join(`tenant:${socket.tenantId || "platform"}`);

    // Perform the side effect or state update expressed on the following line.
    socket.on("register", () => {});

    // Perform the side effect or state update expressed on the following line.
    socket.on("join-room", (room) => {
      // Check the condition (typeof room !== "string" || room.length > 100) and run the matching branch.
      if (typeof room !== "string" || room.length > 100) return;
      // Check the condition (room === `user:${id}`) and run the matching branch.
      if (room === `user:${id}`) socket.join(room);
      // Check the condition (socket.tenantId && room === `tenant:${socket.tenantId}`) and run the matching branch.
      if (socket.tenantId && room === `tenant:${socket.tenantId}`) socket.join(room);
    });

    // Perform the side effect or state update expressed on the following line.
    socket.on("leave-room", (room) => {
      // Check the condition (room === `user:${id}` || (socket.tenantId && room === `tenant:${socket) and run the matching branch.
      if (room === `user:${id}` || (socket.tenantId && room === `tenant:${socket.tenantId}`)) socket.leave(room);
    });

    // Perform the side effect or state update expressed on the following line.
    socket.on("disconnect", () => {
      // Declare sockets for use by the surrounding module or function.
      const sockets = onlineUsers.get(id);
      // Check the condition (!sockets) and run the matching branch.
      if (!sockets) return;
      // Perform the side effect or state update expressed on the following line.
      sockets.delete(socket.id);
      // Check the condition (sockets.size === 0) and run the matching branch.
      if (sockets.size === 0) onlineUsers.delete(id);
    });
  });

  // Return the value of io to the caller.
  return io;
};

// Declare getIO for use by the surrounding module or function.
export const getIO = () => {
  // Check the condition (!io) and run the matching branch.
  if (!io) throw new Error("Socket.io not initialized");
  // Return the value of io to the caller.
  return io;
};

// Declare sendNotificationToUser for use by the surrounding module or function.
export const sendNotificationToUser = (userId, event, data) => {
  // Check the condition (!io) and run the matching branch.
  if (!io) return;
  // Declare sockets for use by the surrounding module or function.
  const sockets = onlineUsers.get(userId.toString());
  // Check the condition (!sockets) and run the matching branch.
  if (!sockets) return;
  // Perform the side effect or state update expressed on the following line.
  sockets.forEach((socketId) => io.to(socketId).emit(event, data));
};

// Declare broadcast for use by the surrounding module or function.
export const broadcast = (event, data) => {
  // Check the condition (!io) and run the matching branch.
  if (!io) return;
  // Perform the side effect or state update expressed on the following line.
  io.emit(event, data);
};

// Declare emitToRoom for use by the surrounding module or function.
export const emitToRoom = (room, event, data) => {
  // Check the condition (!io) and run the matching branch.
  if (!io) return;
  // Perform the side effect or state update expressed on the following line.
  io.to(room).emit(event, data);
};
