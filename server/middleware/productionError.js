/**
 * Purpose: production Error request middleware. Main declarations: productionError.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export default function productionError(err, req, res, next) {
  // Declare requestId for use by the surrounding module or function.
  const requestId = req.requestId;

  // Perform the side effect or state update expressed on the following line.
  console.error({
    requestId,
    name: err.name,
    ...(process.env.NODE_ENV === "production" ? { code: err.code } : { message: err.message }),
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });

  // Declare status for use by the surrounding module or function.
  const status = Number(err.statusCode ?? err.status) || 500;

  // Perform the side effect or state update expressed on the following line.
  res.status(status).json({
    success: false,
    message:
      status >= 500
        ? "Internal server error"
        : err.message,
    requestId,
  });
}
