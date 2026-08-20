import crypto from "crypto";

export default function requestLogger(req, res, next) {
  const requestId = crypto.randomUUID();
  const started = Date.now();

  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);

  res.on("finish", () => {
    const duration = Date.now() - started;
    if (process.env.NODE_ENV !== "test") {
      console.log(JSON.stringify({
        type: "request",
        requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: duration,
      }));
    }
  });

  next();
}
