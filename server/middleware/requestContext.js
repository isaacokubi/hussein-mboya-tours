import crypto from "crypto";

/**
 * Adds a traceable request identifier to every request.
 * Useful for production logs, support tickets, and monitoring systems.
 */
export default function requestContext(req, res, next) {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);

  next();
}
