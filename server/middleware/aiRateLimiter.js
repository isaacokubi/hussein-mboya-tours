/**
 * Purpose: ai Rate Limiter request middleware. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import rateLimit from "express-rate-limit";

// Declare windowMs for use by the surrounding module or function.
const windowMs = Math.max(60_000, Number(process.env.AI_RATE_LIMIT_WINDOW_MS || 15 * 60_000));
// Declare max for use by the surrounding module or function.
const max = Math.max(1, Number(process.env.AI_RATE_LIMIT_MAX || 30));

// Declare aiRateLimiter for use by the surrounding module or function.
export const aiRateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = String(req.tenantId || req.user?.tenantId || "public").trim();
    // Declare userId for use by the surrounding module or function.
    const userId = String(req.user?._id || req.ip || "anonymous").trim();
    // Return the expression shown below to the caller.
    return `ai:${tenantId}:${userId}`;
  },
  handler: (req, res) => res.status(429).json({
    success: false,
    message: "AI request limit reached. Please try again later.",
    retryAfterSeconds: Math.ceil(windowMs / 1000),
  }),
});

export default aiRateLimiter;
