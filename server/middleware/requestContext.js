/**
 * Purpose: request Context request middleware. Main declarations: requestContext.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import crypto from "crypto";

/**
 * Adds a traceable request identifier to every request.
 * Useful for production logs, support tickets, and monitoring systems.
 */
// Define requestContext; its parameters and body implement this operation.
export default function requestContext(req, res, next) {
  // Declare incoming for use by the surrounding module or function.
  const incoming = String(req.headers["x-request-id"] || "").trim();
  // Declare requestId for use by the surrounding module or function.
  const requestId = incoming && /^[A-Za-z0-9._:-]{8,120}$/.test(incoming) ? incoming : crypto.randomUUID();
  // Perform the side effect or state update expressed on the following line.
  req.requestId = requestId;
  // Perform the side effect or state update expressed on the following line.
  res.setHeader("X-Request-ID", requestId);
  // Perform the side effect or state update expressed on the following line.
  next();
}
