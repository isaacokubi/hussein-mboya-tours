import crypto from "crypto";

/**
 * Adds a traceable request identifier to every request.
 * Useful for production logs, support tickets, and monitoring systems.
 */
export default function requestContext(req, res, next) {
  const incoming = String(req.headers["x-request-id"] || "").trim();
  const requestId = incoming && /^[A-Za-z0-9._:-]{8,120}$/.test(incoming) ? incoming : crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
}
