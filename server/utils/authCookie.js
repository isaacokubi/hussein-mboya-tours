import crypto from "node:crypto";

const isProduction = () => String(process.env.NODE_ENV || "development").toLowerCase() === "production";

const cookieOptions = () => ({
  secure: isProduction(),
  sameSite: isProduction() ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

export const setAuthCookie = (res, token) => {
  const options = cookieOptions();
  const csrfToken = crypto.randomBytes(32).toString("hex");

  res.cookie("token", token, {
    ...options,
    httpOnly: true,
  });

  res.cookie("csrfToken", csrfToken, {
    ...options,
    httpOnly: false,
  });

  return csrfToken;
};

export const clearAuthCookies = (res) => {
  const options = cookieOptions();
  res.clearCookie("token", { ...options, httpOnly: true, maxAge: undefined });
  res.clearCookie("csrfToken", { ...options, httpOnly: false, maxAge: undefined });
};
