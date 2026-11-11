/**
 * Purpose: request Logger request middleware. Main declarations: requestLogger.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import crypto from "crypto";

// Define requestLogger; its parameters and body implement this operation.
export default function requestLogger(req, res, next) {
  // Declare requestId for use by the surrounding module or function.
  const requestId = crypto.randomUUID();
  // Declare started for use by the surrounding module or function.
  const started = Date.now();

  // Perform the side effect or state update expressed on the following line.
  req.requestId = requestId;
  // Perform the side effect or state update expressed on the following line.
  res.setHeader("X-Request-ID", requestId);

  // Perform the side effect or state update expressed on the following line.
  res.on("finish", () => {
    // Declare duration for use by the surrounding module or function.
    const duration = Date.now() - started;
    // Check the condition (process.env.NODE_ENV !== "test") and run the matching branch.
    if (process.env.NODE_ENV !== "test") {
      // Perform the side effect or state update expressed on the following line.
      console.log(JSON.stringify({
        type: "request",
        requestId,
        method: req.method,
        // Query strings may contain search terms, identifiers or credentials.
        path: req.path,
        status: res.statusCode,
        durationMs: duration,
      }));
    }
  });

  // Perform the side effect or state update expressed on the following line.
  next();
}
