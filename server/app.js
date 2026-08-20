// server/app.js

import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import env from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { resolveTenant } from "./middleware/tenantMiddleware.js";

const app = express();

if (process.env.NODE_ENV === "production") {
  const originalLog = console.log.bind(console), originalWarn = console.warn.bind(console), originalError = console.error.bind(console);
  const sensitiveKeys = new Set(["body", "callbackResponse", "phone", "phoneNumber", "PhoneNumber", "password", "token", "accessToken", "apiKey", "consumerSecret", "passkey"]);
  const redact = (value, key = "") => {
    if (sensitiveKeys.has(key)) return "[REDACTED]";
    if (Array.isArray(value)) return value.map((item) => redact(item));
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, redact(childValue, childKey)]));
    return value;
  };
  console.log = (...args) => originalLog(...args.map((value) => redact(value)));
  console.warn = (...args) => originalWarn(...args.map((value) => redact(value)));
  console.error = (...args) => originalError(...args.map((value) => redact(value)));
}

app.use("/destinations", express.static("uploads/destinations"));
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" }, hsts: process.env.NODE_ENV === "production" ? undefined : false }));

const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false, skip: (req) => req.path === "/health" });
app.use(globalLimiter);

const configuredOrigins = (env.CLIENT_ORIGINS || env.CLIENT_URL || "").split(",").map((origin) => origin.trim()).filter(Boolean);
const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", ...configuredOrigins].filter((origin, index, list) => list.indexOf(origin) === index);
console.log("CORS allowed origins:", allowedOrigins);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    console.warn("CORS blocked origin:", origin);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "X-Tenant-ID", "X-Tenant-Slug"],
}));

app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", async (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({ success: dbReady, status: dbReady ? "healthy" : "degraded", database: dbReady ? "connected" : "disconnected", timestamp: new Date().toISOString() });
});

app.use("/api", resolveTenant, apiRoutes);

app.get("/", (req, res) => res.status(200).json({ success: true, message: "Travel API running successfully" }));
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

app.use((err, req, res, next) => {
  console.error(err);
  let status = Number(err.statusCode) || 500;
  let message = err.message || "Internal server error";
  if (err.name === "ValidationError" || err.name === "CastError") status = 400;
  if (err.code === 11000) {
    status = 409;
    const duplicateField = Object.keys(err.keyPattern || err.keyValue || {})[0];
    message = duplicateField ? `A record with this ${duplicateField} already exists.` : "A record with these unique details already exists.";
  }
  res.status(status).json({ success: false, message, ...(err.name === "ValidationError" ? { errors: Object.fromEntries(Object.entries(err.errors || {}).map(([key, value]) => [key, value.message])) } : {}) });
});

export default app;
