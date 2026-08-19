import rateLimit from "express-rate-limit";

const common = {
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
};

export const loginRateLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

export const passwordResetRateLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: {
    success: false,
    message: "Too many password reset requests. Please try again later.",
  },
});

// MFA is an authentication boundary and is intentionally stricter than the
// normal login limiter. These limits are per client IP by default.
export const mfaSendRateLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 3,
  message: {
    success: false,
    message: "Too many MFA code requests. Please try again later.",
  },
});

export const mfaVerifyRateLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 6,
  message: {
    success: false,
    message: "Too many MFA verification attempts. Please try again later.",
  },
});
