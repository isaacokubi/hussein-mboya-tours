export const LOGIN_LIMIT = 10;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export function getSafeDemoApiOrigin(value = "https://hussein-mboya-tours.onrender.com") {
  const parsed = new URL(value);
  if (parsed.protocol !== "https:" || parsed.pathname !== "/" || parsed.search || parsed.hash || parsed.username || parsed.password) {
    throw new Error("DEMO_API_BASE_URL must be an HTTPS origin without credentials or a path.");
  }
  return parsed.origin;
}

export function needsLoginWindowWait(completedLogins, totalLogins) {
  return completedLogins > 0 && completedLogins < totalLogins && completedLogins % LOGIN_LIMIT === 0;
}
