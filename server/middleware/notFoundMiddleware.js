/**
 * Purpose: not Found Middleware request middleware. Main declarations: notFound.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
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

// Declare notFound for use by the surrounding module or function.
const notFound = (req, res, next) => {
    // Declare error for use by the surrounding module or function.
    const error = new Error(`Route ${req.originalUrl} not found`);

    // Perform the side effect or state update expressed on the following line.
    res.status(404);

    // Perform the side effect or state update expressed on the following line.
    next(error);
};

export default notFound;
