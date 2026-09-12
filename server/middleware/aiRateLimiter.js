import rateLimit from "express-rate-limit";

const windowMs = Math.max(60_000, Number(process.env.AI_RATE_LIMIT_WINDOW_MS || 15 * 60_000));
const max = Math.max(1, Number(process.env.AI_RATE_LIMIT_MAX || 30));

export const aiRateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const tenantId = String(req.tenantId || req.user?.tenantId || "public").trim();
    const userId = String(req.user?._id || req.ip || "anonymous").trim();
    return `ai:${tenantId}:${userId}`;
  },
  handler: (req, res) => res.status(429).json({
    success: false,
    message: "AI request limit reached. Please try again later.",
    retryAfterSeconds: Math.ceil(windowMs / 1000),
  }),
});

export default aiRateLimiter;
