// Import secure random-byte generation for the anti-CSRF token.
import crypto from "node:crypto";

// Determine whether cookies should use production-only security settings.
const isProduction = () => String(process.env.NODE_ENV || "development").toLowerCase() === "production";

// Build shared cookie settings so issuing and clearing cookies stay consistent.
const cookieOptions = () => ({
  // Require HTTPS in production so authentication cookies are not sent over plain HTTP.
  secure: isProduction(),
  // Allow cross-site cookies in production; use the stricter lax policy during development.
  sameSite: isProduction() ? "none" : "lax",
  // Set the cookie lifetime to seven days, in milliseconds.
  maxAge: 7 * 24 * 60 * 60 * 1000,
  // Make the cookie available to routes throughout the application.
  path: "/",
});

// Set the signed authentication cookie and return a CSRF token for the client.
export const setAuthCookie = (res, token) => {
  // Reuse the common settings for both cookies.
  const options = cookieOptions();
  // Generate a hard-to-guess token that can be used in CSRF protection.
  const csrfToken = crypto.randomBytes(32).toString("hex");

  // Store the authentication token in a cookie that browser JavaScript cannot read.
  res.cookie("token", token, {
    // Apply the shared lifetime, path and browser security settings.
    ...options,
    // Prevent scripts from accessing the sensitive authentication token.
    httpOnly: true,
  });

  // Store the CSRF token separately so the frontend can read and submit it.
  res.cookie("csrfToken", csrfToken, {
    // Keep its expiry and site settings aligned with the authentication cookie.
    ...options,
    // Allow the frontend to read this non-secret anti-CSRF value for request headers.
    httpOnly: false,
  });

  // Return the same CSRF token so the caller can expose it through the expected response.
  return csrfToken;
};

// Clear both authentication-related cookies during logout or session cleanup.
export const clearAuthCookies = (res) => {
  // Recreate the same path/security attributes used when the cookies were set.
  const options = cookieOptions();
  // Remove the HTTP-only authentication cookie using matching cookie attributes.
  res.clearCookie("token", { ...options, httpOnly: true, maxAge: undefined });
  // Remove the frontend-readable CSRF cookie using matching cookie attributes.
  res.clearCookie("csrfToken", { ...options, httpOnly: false, maxAge: undefined });
};
