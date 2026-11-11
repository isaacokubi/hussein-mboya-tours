/**
 * Purpose: rate Limiter request middleware. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import rateLimit from "express-rate-limit";

// Declare rateLimiter for use by the surrounding module or function.
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

export default rateLimiter;
