// server/app.js

import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";
import Organization from "./models/Organization.js";
import WebsiteIntegrationKey from "./models/WebsiteIntegrationKey.js";
import loadTenantPlugin from "./config/tenantPluginLoader.js";
import requestContext from "./middleware/requestContext.js";
import { publicErrorMessage } from "./utils/publicError.js";
import { getStartupPhase } from "./startup/readiness.js";

loadTenantPlugin();

import rateLimit from "express-rate-limit";
import env from "./config/env.js";
import apiRoutes from "./routes/index.js";
import publicOnboardingRoutes from "./routes/publicOnboardingRoutes.js";
import { resolveTenant } from "./middleware/tenantMiddleware.js";
import tenantBrandingRoutes from "./routes/tenantBrandingRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import databaseRoutes from "./routes/databaseRoutes.js";
import systemHealthRoutes from "./routes/systemHealthRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import tenantSubscriptionRoutes from "./routes/tenantSubscriptionRoutes.js";

const app = express();

app.set("trust proxy", 1);

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

app.use(requestContext);
app.use("/destinations", express.static("uploads/destinations"));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: process.env.NODE_ENV === "production" ? undefined : false,
  contentSecurityPolicy: {
    directives: {
      imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://res.cloudinary.com"],
      mediaSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
    },
  },
}));

const databaseStatus = () => ({
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
}[mongoose.connection.readyState] || "disconnected");

const readinessPayload = () => {
  const startup = getStartupPhase();
  const database = databaseStatus();
  const ready = startup === "ready" && database === "connected";
  return {
    success: ready,
    status: ready ? "healthy" : startup === "starting" ? "starting" : "degraded",
    startup,
    database,
    version: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || "unknown",
    timestamp: new Date().toISOString(),
  };
};

// Health and informational root routes stay reachable while the database and
// required startup migration initialize. Health still reports non-ready states.
app.get("/api/health", (req, res) => {
  const payload = readinessPayload();
  res.status(payload.success ? 200 : 503).json({ ...payload, requestId: req.requestId });
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/api/health",
  keyGenerator: (req) => req.ip || req.socket?.remoteAddress || "anonymous",
});
app.use(globalLimiter);

app.get("/", (req, res) => res.status(200).json({ success: true, message: "Travel API running successfully", requestId: req.requestId }));

app.use((req, res, next) => {
  const payload = readinessPayload();
  if (payload.success) return next();
  return res.status(503).json({ ...payload, requestId: req.requestId });
});

const configuredOrigins = (env.CLIENT_ORIGINS || env.CLIENT_URL || "").split(",").map((origin) => origin.trim()).filter(Boolean);
const allowedOrigins = [
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173", "http://127.0.0.1:5173"]),
  ...configuredOrigins,
].filter((origin, index, list) => list.indexOf(origin) === index);

const corsOptions = {
  origin: async (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    try {
      const parsedOrigin = new URL(origin);
      if (process.env.NODE_ENV === "production" && parsedOrigin.protocol !== "https:") {
        return callback(null, false);
      }
      const normalizedOrigin = parsedOrigin.origin.toLowerCase();
      const hostname = parsedOrigin.hostname.toLowerCase();
      const configuredPlatformHost = String(process.env.PLATFORM_HOST || "globaltours.com").trim().toLowerCase();
      const platformSuffix = `.${configuredPlatformHost}`;
      let tenantOrigin = null;

      if (hostname.endsWith(platformSuffix)) {
        const labels = hostname.slice(0, -platformSuffix.length).split(".").filter(Boolean);
        if (labels.length === 1 && !["www", "api", "app", "admin"].includes(labels[0])) {
          tenantOrigin = await Organization.findOne({ slug: labels[0], status: { $in: ["active", "trial"] } }).select("_id").lean();
        }
      } else {
        tenantOrigin = await Organization.findOne({ domain: hostname, status: { $in: ["active", "trial"] } }).select("_id").lean();
      }

      if (!tenantOrigin) {
        tenantOrigin = await WebsiteIntegrationKey.findOne({
          active: true,
          revokedAt: null,
          allowedOrigins: normalizedOrigin,
        }).select("_id").lean();
      }
      return tenantOrigin
        ? callback(null, true)
        : callback(null, false);
    } catch {
      return callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "X-Tenant-ID", "X-Tenant-Slug", "X-Tenant-Key", "X-API-Key", "X-Integration-Key", "X-Public-Integration-Key", "Idempotency-Key", "X-Request-ID"],
};

app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(resolveTenant);

app.use("/api/public/onboarding", publicOnboardingRoutes);
app.use("/api/tenant/branding", tenantBrandingRoutes);

// Mount subscription before the consolidated /api router. The /api router contains
// a catch-all SEO router, so mounting subscription after it allows that catch-all to
// answer /api/subscription with a false "Route not found" response.
app.use("/api/subscription", tenantSubscriptionRoutes);

app.use("/api", apiRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/system", systemHealthRoutes);
app.use("/api/superadmin", superAdminRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found", requestId: req.requestId }));
app.use((err, req, res, next) => {
  console.error(process.env.NODE_ENV === "production"
    ? { requestId: req.requestId, name: err?.name, code: err?.code }
    : { requestId: req.requestId, error: err });
  let status = Number(err.statusCode ?? err.status ?? 500);
  if (!Number.isInteger(status) || status < 400 || status > 599) status = 500;
  if (err.name === "ValidationError" || err.name === "CastError") status = 400;
  if (err.code === 11000) status = 409;
  const message = publicErrorMessage(err, "Internal server error", status);
  const includeValidationErrors = err.name === "ValidationError" && process.env.NODE_ENV !== "production";
  res.status(status).json({ success: false, message, requestId: req.requestId, ...(includeValidationErrors ? { errors: Object.fromEntries(Object.entries(err.errors || {}).map(([key, value]) => [key, value.message])) } : {}) });
});

export default app;
