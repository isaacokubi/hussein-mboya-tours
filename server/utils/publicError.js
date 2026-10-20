// Select a safe error message to return to the API client.
export function publicErrorMessage(error, fallback = "Internal server error", statusOverride) {
  // In development, preserve the original message to help diagnose local failures.
  if (process.env.NODE_ENV !== "production") return error?.message || fallback;

  // Determine the HTTP status from an explicit override, the error, or the server-error default.
  const status = Number(statusOverride ?? error?.statusCode ?? error?.status ?? 500);
  // Translate MongoDB duplicate-key errors into a safe conflict explanation.
  if (error?.code === 11000) return "A record with these unique details already exists.";
  // Hide internal model details for invalid or uncastable request values.
  if (["ValidationError", "CastError"].includes(error?.name)) return "Invalid request data.";
  // Allow explicitly marked safe client errors to expose their message for HTTP error statuses.
  if (error?.expose === true && status >= 400 && status < 600) return error.message || fallback;
  // Use the generic fallback for server errors or invalid status values.
  if (status >= 500 || !Number.isInteger(status)) return fallback;
  // Return a client-safe message for other expected HTTP errors.
  return error?.message || fallback;
}
