/**
 * Purpose: auth Cookie server application module. Main declarations: isProduction, cookieOptions, setAuthCookie, clearAuthCookies.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import crypto from "node:crypto";

// Declare isProduction for use by the surrounding module or function.
const isProduction = () => String(process.env.NODE_ENV || "development").toLowerCase() === "production";

// Declare cookieOptions for use by the surrounding module or function.
const cookieOptions = () => ({
  secure: isProduction(),
  sameSite: isProduction() ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

// Declare setAuthCookie for use by the surrounding module or function.
export const setAuthCookie = (res, token) => {
  // Declare options for use by the surrounding module or function.
  const options = cookieOptions();
  // Declare csrfToken for use by the surrounding module or function.
  const csrfToken = crypto.randomBytes(32).toString("hex");

  // Perform the side effect or state update expressed on the following line.
  res.cookie("token", token, {
    ...options,
    httpOnly: true,
  });

  // Perform the side effect or state update expressed on the following line.
  res.cookie("csrfToken", csrfToken, {
    ...options,
    httpOnly: false,
  });

  // Return the value of csrfToken to the caller.
  return csrfToken;
};

// Declare clearAuthCookies for use by the surrounding module or function.
export const clearAuthCookies = (res) => {
  // Declare options for use by the surrounding module or function.
  const options = cookieOptions();
  // Perform the side effect or state update expressed on the following line.
  res.clearCookie("token", { ...options, httpOnly: true, maxAge: undefined });
  // Perform the side effect or state update expressed on the following line.
  res.clearCookie("csrfToken", { ...options, httpOnly: false, maxAge: undefined });
};
