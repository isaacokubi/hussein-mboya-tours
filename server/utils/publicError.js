/**
 * Purpose: public Error server application module. Main declarations: publicErrorMessage.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export function publicErrorMessage(error, fallback = "Internal server error", statusOverride) {
  // Check the condition (error?.type === "entity.parse.failed") and run the matching branch.
  if (error?.type === "entity.parse.failed") return "Invalid JSON request body.";
  // Check the condition (process.env.NODE_ENV !== "production") and run the matching branch.
  if (process.env.NODE_ENV !== "production") return error?.message || fallback;

  // Declare status for use by the surrounding module or function.
  const status = Number(statusOverride ?? error?.statusCode ?? error?.status ?? 500);
  // Check the condition (error?.code === 11000) and run the matching branch.
  if (error?.code === 11000) return "A record with these unique details already exists.";
  // Check the condition (["ValidationError", "CastError"].includes(error?.name)) and run the matching branch.
  if (["ValidationError", "CastError"].includes(error?.name)) return "Invalid request data.";
  // Check the condition (error?.expose === true && status >= 400 && status < 600) and run the matching branch.
  if (error?.expose === true && status >= 400 && status < 600) return error.message || fallback;
  // Check the condition (status >= 500 || !Number.isInteger(status)) and run the matching branch.
  if (status >= 500 || !Number.isInteger(status)) return fallback;
  // Return the expression shown below to the caller.
  return error?.message || fallback;
}
