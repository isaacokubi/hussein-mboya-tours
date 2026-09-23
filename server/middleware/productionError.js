export default function productionError(err, req, res, next) {
  const requestId = req.requestId;

  console.error({
    requestId,
    name: err.name,
    ...(process.env.NODE_ENV === "production" ? { code: err.code } : { message: err.message }),
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });

  const status = Number(err.statusCode ?? err.status) || 500;

  res.status(status).json({
    success: false,
    message:
      status >= 500
        ? "Internal server error"
        : err.message,
    requestId,
  });
}
