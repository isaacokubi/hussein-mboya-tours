// server/app.js — compose the Express application and its global middleware/routes.

// Express provides the HTTP application and routing framework.
import express from "express";
// Helmet adds security-related HTTP response headers.
import helmet from "helmet";
// CORS controls which browser origins may call this API.
import cors from "cors";
// Compression reduces response size for supported clients.
import compression from "compression";
// Cookie parser makes incoming cookie values available on the request.
import cookieParser from "cookie-parser";
// Morgan logs HTTP requests, with sensitive routes excluded below.
import morgan from "morgan";
// Mongoose exposes MongoDB connection state for readiness reporting.
import mongoose from "mongoose";
// Organization records are used to validate tenant subdomains and custom domains.
import Organization from "./models/Organization.js";
// Website integration keys authorize configured origins for embedded booking widgets.
import WebsiteIntegrationKey from "./models/WebsiteIntegrationKey.js";
// Register tenant-aware Mongoose behavior before models and queries are used.
import loadTenantPlugin from "./config/tenantPluginLoader.js";
// Attach request-scoped context such as the request ID to each incoming request.
import requestContext from "./middleware/requestContext.js";
// Convert internal errors into safe messages suitable for API responses.
import { publicErrorMessage } from "./utils/publicError.js";
// Read startup state so health endpoints can distinguish starting from ready.
import { getStartupPhase } from "./startup/readiness.js";
// Reuse the same configured-origin parsing and comparison rules throughout CORS.
import { getConfiguredOrigins, isConfiguredOrigin } from "./config/corsPolicy.js";

// Ensure tenant-aware query protections are installed before application queries run.
loadTenantPlugin();

// Rate-limit requests to reduce accidental overload and basic abuse.
import rateLimit from "express-rate-limit";
// Import validated environment settings used by middleware configuration.
import env from "./config/env.js";
// Mount the main API route collection.
import apiRoutes from "./routes/index.js";
// Resolve and attach the authenticated/validated tenant context to requests.
import { resolveTenant } from "./middleware/tenantMiddleware.js";
// Mount routes that return tenant-specific public branding.
import tenantBrandingRoutes from "./routes/tenantBrandingRoutes.js";
// Mount application settings endpoints.
import settingsRoutes from "./routes/settingsRoutes.js";
// Mount controlled database administration endpoints.
import databaseRoutes from "./routes/databaseRoutes.js";
// Mount system health/diagnostic endpoints.
import systemHealthRoutes from "./routes/systemHealthRoutes.js";
// Mount platform-wide SuperAdmin endpoints.
import superAdminRoutes from "./routes/superAdminRoutes.js";
// Mount tenant subscription endpoints before catch-all API routes.
import tenantSubscriptionRoutes from "./routes/tenantSubscriptionRoutes.js";
// Mount restricted staging bootstrap routes used for controlled test setup.
import stagingAdminRoutes from "./routes/internal/stagingSuperAdminBootstrapRoutes.js";

// Create the Express application object without listening on a network port here.
const app = express();

// Tell Express it runs behind one trusted reverse proxy, as with common hosting platforms.
app.set("trust proxy", 1);

// Redact known sensitive values from console logs in production.
if (process.env.NODE_ENV === "production") {
  // Preserve the original logging functions so sanitized messages can still be emitted.
  const originalLog = console.log.bind(console), originalWarn = console.warn.bind(console), originalError = console.error.bind(console);
  // List object-property names whose values must never be printed to logs.
  const sensitiveKeys = new Set(["body", "callbackResponse", "phone", "phoneNumber", "PhoneNumber", "password", "token", "accessToken", "apiKey", "consumerSecret", "passkey"]);
  // Recursively sanitize objects and arrays before they reach the logging functions.
  const redact = (value, key = "") => {
    if (sensitiveKeys.has(key)) return "[REDACTED]"; // Hide values under known sensitive keys.
    if (Array.isArray(value)) return value.map((item) => redact(item)); // Sanitize every array item.
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, redact(childValue, childKey)])); // Sanitize nested object properties.
    return value; // Leave non-sensitive scalar values unchanged.
  };
  // Replace console methods with wrappers that sanitize every argument.
  console.log = (...args) => originalLog(...args.map((value) => redact(value)));
  console.warn = (...args) => originalWarn(...args.map((value) => redact(value)));
  console.error = (...args) => originalError(...args.map((value) => redact(value)));
}

// Add request metadata before handlers so downstream code can log a correlation ID.
app.use(requestContext);
// Serve locally stored destination images from this static URL prefix.
app.use("/destinations", express.static("uploads/destinations"));

// Set security headers and allow the image/media sources used by the frontend.
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Permit intended cross-origin image resources.
  hsts: process.env.NODE_ENV === "production" ? undefined : false, // Enable Helmet's production HSTS default only in production.
  contentSecurityPolicy: {
    directives: {
      imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://res.cloudinary.com"], // Whitelist expected image sources.
      mediaSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"], // Whitelist expected media sources.
    },
  },
}));

// Translate Mongoose's numeric connection states into readable health values.
const databaseStatus = () => ({
  0: "disconnected", // No active connection.
  1: "connected", // Database connection is open.
  2: "connecting", // Connection attempt is in progress.
  3: "disconnecting", // Connection is closing.
}[mongoose.connection.readyState] || "disconnected"); // Treat unknown values as disconnected.

// Assemble safe readiness information for health endpoints and deployment checks.
const readinessPayload = () => {
  const startup = getStartupPhase(); // Read the startup/migration lifecycle state.
  const database = databaseStatus(); // Read the current MongoDB connection state.
  const ready = startup === "ready" && database === "connected"; // Ready requires startup completion and database connectivity.
  return {
    success: ready, // Machine-readable readiness result.
    status: ready ? "healthy" : startup === "starting" ? "starting" : "degraded", // Human-readable service state.
    startup, // Expose the startup phase without secrets.
    database, // Expose database connection state without its URI.
    // Safe readiness metadata for deployment verification. Never include the
    // MongoDB URI or credentials in a public health response.
    databaseName: database === "connected" ? mongoose.connection.db?.databaseName || null : null, // Name only, when connected.
    version: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || "unknown", // Identify the deployed source revision when the host provides it.
    timestamp: new Date().toISOString(), // Timestamp the health snapshot in UTC.
  };
};

// Keep health checks reachable during startup while accurately returning not-ready status.
app.get("/api/health", (req, res) => {
  const payload = readinessPayload(); // Gather current readiness state.
  res.status(payload.success ? 200 : 503).json({ ...payload, requestId: req.requestId }); // Use 200 only when ready; otherwise signal temporary unavailability.
});

// Apply a general request limit while exempting the health probe used by hosting platforms.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Count requests over a 15-minute window.
  limit: 300, // Permit up to 300 requests per client key in that window.
  standardHeaders: true, // Return standardized rate-limit headers.
  legacyHeaders: false, // Omit older, non-standard rate-limit headers.
  skip: (req) => req.path === "/api/health", // Keep health probes from consuming the ordinary request budget.
  keyGenerator: (req) => req.ip || req.socket?.remoteAddress || "anonymous", // Use the best available client network identifier.
});
// Apply the limiter to requests that follow this middleware.
app.use(globalLimiter);

// Provide a simple root endpoint for deployment and connectivity checks.
app.get("/", (req, res) => res.status(200).json({ success: true, message: "Travel API running successfully", requestId: req.requestId }));

// Parse the origins explicitly configured for this environment.
const configuredOrigins = getConfiguredOrigins(env);
// Add local frontend origins only outside production, then append configured origins.
const allowedOrigins = [
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173", "http://127.0.0.1:5173"]),
  ...configuredOrigins,
].filter((origin, index, list) => list.indexOf(origin) === index); // Remove duplicate origins.

// Decide whether each browser origin may make a credentialed request.
const corsOptions = {
  origin: async (origin, callback) => {
    // Allow non-browser requests without an Origin header and explicitly configured origins.
    if (!origin || isConfiguredOrigin(origin, allowedOrigins)) return callback(null, true);
    try {
      const parsedOrigin = new URL(origin); // Parse the origin before inspecting its host/protocol.
      if (process.env.NODE_ENV === "production" && parsedOrigin.protocol !== "https:") {
        return callback(null, false); // Never allow insecure HTTP origins in production.
      }
      const normalizedOrigin = parsedOrigin.origin.toLowerCase(); // Normalize scheme/host/port for exact matching.
      const hostname = parsedOrigin.hostname.toLowerCase(); // Normalize hostname for tenant lookup.
      const configuredPlatformHost = String(process.env.PLATFORM_HOST || "globaltours.com").trim().toLowerCase(); // Read the platform's base domain.
      const platformSuffix = `.${configuredPlatformHost}`; // Build the suffix used by tenant subdomains.
      let tenantOrigin = null; // Store a matching active tenant or integration key, if found.

      if (hostname.endsWith(platformSuffix)) {
        const labels = hostname.slice(0, -platformSuffix.length).split(".").filter(Boolean); // Extract labels preceding the platform domain.
        if (labels.length === 1 && !["www", "api", "app", "admin"].includes(labels[0])) {
          // Permit a tenant subdomain only when that tenant is active or trialing.
          tenantOrigin = await Organization.findOne({ slug: labels[0], status: { $in: ["active", "trial"] } }).select("_id").lean();
        }
      } else {
        // For custom domains, require an exact match to an active tenant's configured domain.
        tenantOrigin = await Organization.findOne({ domain: hostname, status: { $in: ["active", "trial"] } }).select("_id").lean();
      }

      if (!tenantOrigin) {
        // An embedded booking widget may instead be authorized by an active integration key.
        tenantOrigin = await WebsiteIntegrationKey.findOne({
          active: true, // Ignore disabled integration keys.
          revokedAt: null, // Ignore keys that have been revoked.
          allowedOrigins: normalizedOrigin, // Require an exact configured origin match.
        }).select("_id").lean();
      }
      return tenantOrigin
        ? callback(null, true) // A tenant or integration record authorized the origin.
        : callback(null, false); // No matching record means the browser origin is rejected.
    } catch {
      return callback(null, false); // Malformed origins or lookup failures fail closed.
    }
  },
  credentials: true, // Allow browser credentials only for origins approved above.
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // List supported HTTP methods for browser requests.
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "X-Tenant-ID", "X-Tenant-Slug", "X-Tenant-Key", "X-API-Key", "X-Integration-Key", "X-Public-Integration-Key", "Idempotency-Key", "X-Request-ID", "X-Staging-Tenant-Admin-Reset-Token"], // Permit headers used by auth, tenant resolution and idempotency.
};

// Register the CORS policy before application routes.
app.use(cors(corsOptions));

// Refuse database-backed API traffic until MongoDB is connected.
app.use((req, res, next) => {
  const payload = readinessPayload(); // Read the current service and database state.
  // Database connectivity is the hard dependency for API requests. Do not
  // block authentication merely because a non-critical startup migration is
  // still running or has failed; this was causing transient 503 login errors
  // immediately after deployments.
  if (payload.database === "connected") return next(); // Continue when the database can serve requests.
  return res.status(503).json({ ...payload, requestId: req.requestId }); // Tell callers to retry when the database is offline.
});

// Compress eligible response bodies to reduce network transfer size.
app.use(compression());
// Parse JSON bodies and reject unusually large payloads.
app.use(express.json({ limit: "1mb" }));
// Parse URL-encoded form submissions with the same body-size limit.
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
// Make cookie values available on request objects.
app.use(cookieParser());
// Log requests, but skip temporary staging endpoints whose paths must not expose trigger tokens.
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
  // Never log this temporary route's URL: callers must not place the trigger token in a query string.
  skip: (req) => ["/api/internal/staging/reset-tenant-admin-password", "/api/internal/staging/seed-qa"].includes(req.path),
}));
// Register restricted staging setup routes before general tenant resolution.
app.use("/api/internal/staging", stagingAdminRoutes);
// Resolve the tenant context before tenant-scoped routes execute.
app.use(resolveTenant);

// Register tenant branding routes under their public API prefix.
app.use("/api/tenant/branding", tenantBrandingRoutes);

// Mount subscription before the consolidated /api router. The /api router contains
// a catch-all SEO router, so mounting subscription after it allows that catch-all to
// answer /api/subscription with a false "Route not found" response.
app.use("/api/subscription", tenantSubscriptionRoutes);

// Mount the primary API route tree.
app.use("/api", apiRoutes);
// Mount settings endpoints.
app.use("/api/settings", settingsRoutes);
// Mount controlled database endpoints.
app.use("/api/database", databaseRoutes);
// Mount system health endpoints.
app.use("/api/system", systemHealthRoutes);
// Mount platform SuperAdmin endpoints.
app.use("/api/superadmin", superAdminRoutes);

// Return a consistent JSON 404 when no registered route matches the request.
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found", requestId: req.requestId }));
// Centralize errors from routes and middleware so responses and logs remain consistent.
app.use((err, req, res, next) => {
  // In production, log only safe diagnostic fields; in development, include the error object.
  console.error(process.env.NODE_ENV === "production"
    ? { requestId: req.requestId, name: err?.name, code: err?.code }
    : { requestId: req.requestId, error: err });
  // Normalize the requested HTTP status and fall back to 500 for invalid values.
  let status = Number(err.statusCode ?? err.status ?? 500);
  if (!Number.isInteger(status) || status < 400 || status > 599) status = 500; // Only accept valid error status codes.
  if (err.name === "ValidationError" || err.name === "CastError") status = 400; // Invalid model values are client errors.
  if (err.code === 11000) status = 409; // MongoDB duplicate-key errors represent conflicts.
  const message = publicErrorMessage(err, "Internal server error", status); // Avoid exposing unsafe internal error details.
  const includeValidationErrors = err.name === "ValidationError" && process.env.NODE_ENV !== "production"; // Detailed validation errors are development-only.
  // Return the safe error message and request ID; include field-level details only during development.
  res.status(status).json({ success: false, message, requestId: req.requestId, ...(includeValidationErrors ? { errors: Object.fromEntries(Object.entries(err.errors || {}).map(([key, value]) => [key, value.message])) } : {}) });
});

// Export the configured app so startup code and automated tests can use it.
export default app;
