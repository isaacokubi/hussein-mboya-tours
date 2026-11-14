/**
 * Purpose: app server application module. Main declarations: redact, databaseStatus, readinessPayload, getCachedTenantOrigin, cacheTenantOrigin.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/app.js

// Load express so this module can use its exported dependencies.
import express from "express";
// Load helmet so this module can use its exported dependencies.
import helmet from "helmet";
// Load cors so this module can use its exported dependencies.
import cors from "cors";
// Load compression so this module can use its exported dependencies.
import compression from "compression";
// Load cookie-parser so this module can use its exported dependencies.
import cookieParser from "cookie-parser";
// Load morgan so this module can use its exported dependencies.
import morgan from "morgan";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ./models/Organization.js so this module can use its exported dependencies.
import Organization from "./models/Organization.js";
// Load ./models/WebsiteIntegrationKey.js so this module can use its exported dependencies.
import WebsiteIntegrationKey from "./models/WebsiteIntegrationKey.js";
// Load ./config/tenantPluginLoader.js so this module can use its exported dependencies.
import loadTenantPlugin from "./config/tenantPluginLoader.js";
// Load ./middleware/requestContext.js so this module can use its exported dependencies.
import requestContext from "./middleware/requestContext.js";
// Load ./utils/publicError.js so this module can use its exported dependencies.
import { publicErrorMessage } from "./utils/publicError.js";
// Load ./startup/readiness.js so this module can use its exported dependencies.
import { getStartupPhase } from "./startup/readiness.js";
// Load ./config/corsPolicy.js so this module can use its exported dependencies.
import { getConfiguredOrigins, isConfiguredOrigin } from "./config/corsPolicy.js";

// Perform the side effect or state update expressed on the following line.
loadTenantPlugin();

// Load express-rate-limit so this module can use its exported dependencies.
import rateLimit from "express-rate-limit";
// Load ./config/env.js so this module can use its exported dependencies.
import env from "./config/env.js";
// Load ./routes/index.js so this module can use its exported dependencies.
import apiRoutes from "./routes/index.js";
// Load ./middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "./middleware/tenantMiddleware.js";
// Load ./routes/tenantBrandingRoutes.js so this module can use its exported dependencies.
import tenantBrandingRoutes from "./routes/tenantBrandingRoutes.js";
// Load ./routes/settingsRoutes.js so this module can use its exported dependencies.
import settingsRoutes from "./routes/settingsRoutes.js";
// Load ./routes/databaseRoutes.js so this module can use its exported dependencies.
import databaseRoutes from "./routes/databaseRoutes.js";
// Load ./routes/systemHealthRoutes.js so this module can use its exported dependencies.
import systemHealthRoutes from "./routes/systemHealthRoutes.js";
// Load ./routes/superAdminRoutes.js so this module can use its exported dependencies.
import superAdminRoutes from "./routes/superAdminRoutes.js";
// Load ./routes/tenantSubscriptionRoutes.js so this module can use its exported dependencies.
import tenantSubscriptionRoutes from "./routes/tenantSubscriptionRoutes.js";
// Load ./routes/internal/stagingSuperAdminBootstrapRoutes.js so this module can use its exported dependencies.
import stagingAdminRoutes from "./routes/internal/stagingSuperAdminBootstrapRoutes.js";

// Declare app for use by the surrounding module or function.
const app = express();

// Perform the side effect or state update expressed on the following line.
app.set("trust proxy", 1);

// Check the condition (process.env.NODE_ENV === "production") and run the matching branch.
if (process.env.NODE_ENV === "production") {
  // Declare originalLog, originalWarn, originalError for use by the surrounding module or function.
  const originalLog = console.log.bind(console), originalWarn = console.warn.bind(console), originalError = console.error.bind(console);
  // Declare sensitiveKeys for use by the surrounding module or function.
  const sensitiveKeys = new Set(["body", "callbackResponse", "phone", "phoneNumber", "PhoneNumber", "password", "token", "accessToken", "apiKey", "consumerSecret", "passkey"]);
  // Declare redact for use by the surrounding module or function.
  const redact = (value, key = "") => {
    // Check the condition (sensitiveKeys.has(key)) and run the matching branch.
    if (sensitiveKeys.has(key)) return "[REDACTED]";
    // Check the condition (Array.isArray(value)) and run the matching branch.
    if (Array.isArray(value)) return value.map((item) => redact(item));
    // Check the condition (value && typeof value === "object") and run the matching branch.
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, redact(childValue, childKey)]));
    // Return the value of value to the caller.
    return value;
  };
  // Perform the side effect or state update expressed on the following line.
  console.log = (...args) => originalLog(...args.map((value) => redact(value)));
  // Perform the side effect or state update expressed on the following line.
  console.warn = (...args) => originalWarn(...args.map((value) => redact(value)));
  // Perform the side effect or state update expressed on the following line.
  console.error = (...args) => originalError(...args.map((value) => redact(value)));
}

// Perform the side effect or state update expressed on the following line.
app.use(requestContext);
// Perform the side effect or state update expressed on the following line.
app.use("/destinations", express.static("uploads/destinations"));

// Perform the side effect or state update expressed on the following line.
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

// Declare databaseStatus for use by the surrounding module or function.
const databaseStatus = () => ({
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
}[mongoose.connection.readyState] || "disconnected");

// Declare readinessPayload for use by the surrounding module or function.
const readinessPayload = () => {
  // Declare startup for use by the surrounding module or function.
  const startup = getStartupPhase();
  // Declare database for use by the surrounding module or function.
  const database = databaseStatus();
  // Declare ready for use by the surrounding module or function.
  const ready = startup === "ready" && database === "connected";
  // Return the object assembled below to the caller.
  return {
    success: ready,
    status: ready ? "healthy" : startup === "starting" ? "starting" : "degraded",
    startup,
    database,
    // Safe readiness metadata for deployment verification. Never include the
    // MongoDB URI or credentials in a public health response.
    databaseName: database === "connected" ? mongoose.connection.db?.databaseName || null : null,
    version: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || "unknown",
    timestamp: new Date().toISOString(),
  };
};

// Health and informational root routes stay reachable while the database and
// required startup migration initialize. Health still reports non-ready states.
// Perform the side effect or state update expressed on the following line.
app.get("/api/live", (req, res) => res.status(200).json({
  success: true,
  status: "alive",
  timestamp: new Date().toISOString(),
  requestId: req.requestId,
}));

// Perform the side effect or state update expressed on the following line.
app.get("/api/health", (req, res) => {
  // Declare payload for use by the surrounding module or function.
  const payload = readinessPayload();
  // Perform the side effect or state update expressed on the following line.
  res.status(payload.success ? 200 : 503).json({ ...payload, requestId: req.requestId });
});
// Perform the side effect or state update expressed on the following line.
app.get("/api/ready", (req, res) => {
  // Declare payload for use by the surrounding module or function.
  const payload = readinessPayload();
  // Perform the side effect or state update expressed on the following line.
  res.status(payload.success ? 200 : 503).json({ ...payload, requestId: req.requestId });
});

// Declare globalLimiter for use by the surrounding module or function.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/api/health",
  keyGenerator: (req) => req.ip || req.socket?.remoteAddress || "anonymous",
});
// Perform the side effect or state update expressed on the following line.
app.use(globalLimiter);

// Perform the side effect or state update expressed on the following line.
app.get("/", (req, res) => res.status(200).json({ success: true, message: "Travel API running successfully", requestId: req.requestId }));

// Declare configuredOrigins for use by the surrounding module or function.
const configuredOrigins = getConfiguredOrigins(env);
// Cache dynamic tenant-origin checks: without this, every cross-origin API
// request performs one or more MongoDB lookups before the route can run.
// Declare tenantOriginCache for use by the surrounding module or function.
const tenantOriginCache = new Map();
// Declare TENANT_ORIGIN_CACHE_TTL_MS for use by the surrounding module or function.
const TENANT_ORIGIN_CACHE_TTL_MS = 60_000;
// Declare TENANT_ORIGIN_CACHE_MAX_ENTRIES for use by the surrounding module or function.
const TENANT_ORIGIN_CACHE_MAX_ENTRIES = 1_000;
// Declare getCachedTenantOrigin for use by the surrounding module or function.
const getCachedTenantOrigin = (origin) => {
  // Declare cached for use by the surrounding module or function.
  const cached = tenantOriginCache.get(origin);
  // Check the condition (!cached) and run the matching branch.
  if (!cached) return undefined;
  // Check the condition (cached.expiresAt <= Date.now()) and run the matching branch.
  if (cached.expiresAt <= Date.now()) { tenantOriginCache.delete(origin); return undefined; }
  // Return the allowed value to the caller.
  return cached.allowed;
};
// Declare cacheTenantOrigin for use by the surrounding module or function.
const cacheTenantOrigin = (origin, allowed) => {
  // Check the condition (tenantOriginCache.size >= TENANT_ORIGIN_CACHE_MAX_ENTRIES) and run the matching branch.
  if (tenantOriginCache.size >= TENANT_ORIGIN_CACHE_MAX_ENTRIES) {
    // Declare oldest for use by the surrounding module or function.
    const oldest = tenantOriginCache.keys().next().value;
    // Check the condition (oldest) and run the matching branch.
    if (oldest) tenantOriginCache.delete(oldest);
  }
  // Perform the side effect or state update expressed on the following line.
  tenantOriginCache.set(origin, { allowed, expiresAt: Date.now() + TENANT_ORIGIN_CACHE_TTL_MS });
};
// Declare allowedOrigins for use by the surrounding module or function.
const allowedOrigins = [
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173", "http://127.0.0.1:5173"]),
  ...configuredOrigins,
].filter((origin, index, list) => list.indexOf(origin) === index);

// Declare corsOptions for use by the surrounding module or function.
const corsOptions = {
  origin: async (origin, callback) => {
    // Check the condition (!origin || isConfiguredOrigin(origin, allowedOrigins)) and run the matching branch.
    if (!origin || isConfiguredOrigin(origin, allowedOrigins)) return callback(null, true);
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare parsedOrigin for use by the surrounding module or function.
      const parsedOrigin = new URL(origin);
      // Check the condition (process.env.NODE_ENV === "production" && parsedOrigin.protocol !== "ht) and run the matching branch.
      if (process.env.NODE_ENV === "production" && parsedOrigin.protocol !== "https:") {
        // Return the result of callback() to the caller.
        return callback(null, false);
      }
      // Declare normalizedOrigin for use by the surrounding module or function.
      const normalizedOrigin = parsedOrigin.origin.toLowerCase();
      // Declare cachedOriginDecision for use by the surrounding module or function.
      const cachedOriginDecision = getCachedTenantOrigin(normalizedOrigin);
      // Check the condition (cachedOriginDecision !== undefined) and run the matching branch.
      if (cachedOriginDecision !== undefined) return callback(null, cachedOriginDecision);
      // Declare hostname for use by the surrounding module or function.
      const hostname = parsedOrigin.hostname.toLowerCase();
      // Declare configuredPlatformHost for use by the surrounding module or function.
      const configuredPlatformHost = String(process.env.PLATFORM_HOST || "").trim().toLowerCase();
      // Declare platformSuffix for use by the surrounding module or function.
      const platformSuffix = `.${configuredPlatformHost}`;
      // Declare tenantOrigin for use by the surrounding module or function.
      let tenantOrigin = null;

      // Check the condition (hostname.endsWith(platformSuffix)) and run the matching branch.
      if (hostname.endsWith(platformSuffix)) {
        // Declare labels for use by the surrounding module or function.
        const labels = hostname.slice(0, -platformSuffix.length).split(".").filter(Boolean);
        // Check the condition (labels.length === 1 && !["www", "api", "app", "admin"].includes(labels) and run the matching branch.
        if (labels.length === 1 && !["www", "api", "app", "admin"].includes(labels[0])) {
          // Perform the side effect or state update expressed on the following line.
          tenantOrigin = await Organization.findOne({ slug: labels[0], status: { $in: ["active", "trial"] } }).select("_id").lean();
        }
      } else {
        // Perform the side effect or state update expressed on the following line.
        tenantOrigin = await Organization.findOne({ domain: hostname, status: { $in: ["active", "trial"] } }).select("_id").lean();
      }

      // Check the condition (!tenantOrigin) and run the matching branch.
      if (!tenantOrigin) {
        // Perform the side effect or state update expressed on the following line.
        tenantOrigin = await WebsiteIntegrationKey.findOne({
          active: true,
          revokedAt: null,
          allowedOrigins: normalizedOrigin,
        }).select("_id").lean();
      }
      // Declare allowed for use by the surrounding module or function.
      const allowed = Boolean(tenantOrigin);
      // Perform the side effect or state update expressed on the following line.
      cacheTenantOrigin(normalizedOrigin, allowed);
      // Return the result of callback() to the caller.
      return callback(null, allowed);
    } catch {
      // Return the result of callback() to the caller.
      return callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "X-Tenant-ID", "X-Tenant-Slug", "X-Tenant-Key", "X-API-Key", "X-Integration-Key", "X-Public-Integration-Key", "Idempotency-Key", "X-Request-ID", "X-Staging-Tenant-Admin-Reset-Token"],
};

// Perform the side effect or state update expressed on the following line.
app.use(cors(corsOptions));

// Perform the side effect or state update expressed on the following line.
app.use((req, res, next) => {
  // Declare payload for use by the surrounding module or function.
  const payload = readinessPayload();
  // Database connectivity is the hard dependency for API requests. Do not
  // block authentication merely because a non-critical startup migration is
  // still running or has failed; this was causing transient 503 login errors
  // immediately after deployments.
  // Check the condition (payload.database === "connected") and run the matching branch.
  if (payload.database === "connected") return next();
  // Return the result of res.status(503).json() to the caller.
  return res.status(503).json({ ...payload, requestId: req.requestId });
});

// Perform the side effect or state update expressed on the following line.
app.use(compression());
// Perform the side effect or state update expressed on the following line.
app.use(express.json({ limit: "1mb", verify: (req, res, buffer) => { req.rawBody = Buffer.from(buffer); } }));
// Perform the side effect or state update expressed on the following line.
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
// Perform the side effect or state update expressed on the following line.
app.use(cookieParser());
// Perform the side effect or state update expressed on the following line.
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
  // Never log this temporary route's URL: callers must not place the trigger token in a query string.
  skip: (req) => ["/api/internal/staging/reset-tenant-admin-password", "/api/internal/staging/seed-qa"].includes(req.path),
}));
// Perform the side effect or state update expressed on the following line.
app.use("/api/internal/staging", stagingAdminRoutes);
// Perform the side effect or state update expressed on the following line.
app.use(resolveTenant);

// Perform the side effect or state update expressed on the following line.
app.use("/api/tenant/branding", tenantBrandingRoutes);

// Mount subscription before the consolidated /api router. The /api router contains
// a catch-all SEO router, so mounting subscription after it allows that catch-all to
// answer /api/subscription with a false "Route not found" response.
// Perform the side effect or state update expressed on the following line.
app.use("/api/subscription", tenantSubscriptionRoutes);

// Perform the side effect or state update expressed on the following line.
app.use("/api", apiRoutes);
// Perform the side effect or state update expressed on the following line.
app.use("/api/settings", settingsRoutes);
// Perform the side effect or state update expressed on the following line.
app.use("/api/database", databaseRoutes);
// Perform the side effect or state update expressed on the following line.
app.use("/api/system", systemHealthRoutes);
// Perform the side effect or state update expressed on the following line.
app.use("/api/superadmin", superAdminRoutes);

// Perform the side effect or state update expressed on the following line.
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found", requestId: req.requestId }));
// Perform the side effect or state update expressed on the following line.
app.use((err, req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  console.error(process.env.NODE_ENV === "production"
    ? { requestId: req.requestId, name: err?.name, code: err?.code }
    : { requestId: req.requestId, error: err });
  // Declare status for use by the surrounding module or function.
  let status = Number(err.statusCode ?? err.status ?? 500);
  // Check the condition (!Number.isInteger(status) || status < 400 || status > 599) and run the matching branch.
  if (!Number.isInteger(status) || status < 400 || status > 599) status = 500;
  // Check the condition (err.name === "ValidationError" || err.name === "CastError") and run the matching branch.
  if (err.name === "ValidationError" || err.name === "CastError") status = 400;
  // Check the condition (err.code === 11000) and run the matching branch.
  if (err.code === 11000) status = 409;
  // Declare message for use by the surrounding module or function.
  const message = publicErrorMessage(err, "Internal server error", status);
  // Declare includeValidationErrors for use by the surrounding module or function.
  const includeValidationErrors = err.name === "ValidationError" && process.env.NODE_ENV !== "production";
  // Perform the side effect or state update expressed on the following line.
  res.status(status).json({ success: false, message, requestId: req.requestId, ...(includeValidationErrors ? { errors: Object.fromEntries(Object.entries(err.errors || {}).map(([key, value]) => [key, value.message])) } : {}) });
});

export default app;
