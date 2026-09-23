export function publicErrorMessage(error, fallback = "Internal server error", statusOverride) {
  if (process.env.NODE_ENV !== "production") return error?.message || fallback;

  const status = Number(statusOverride ?? error?.statusCode ?? error?.status ?? 500);
  if (error?.code === 11000) return "A record with these unique details already exists.";
  if (["ValidationError", "CastError"].includes(error?.name)) return "Invalid request data.";
  if (error?.expose === true && status >= 400 && status < 600) return error.message || fallback;
  if (status >= 500 || !Number.isInteger(status)) return fallback;
  return error?.message || fallback;
}
