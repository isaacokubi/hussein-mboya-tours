// server/middleware/notFound.js

/*
|--------------------------------------------------------------------------
| NOT FOUND MIDDLEWARE
|--------------------------------------------------------------------------
|
| Handles requests to routes that do not exist.
|
|--------------------------------------------------------------------------
*/

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found`,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
};

export default notFound;