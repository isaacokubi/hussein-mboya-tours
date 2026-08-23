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
    const error = new Error(`Route ${req.originalUrl} not found`);

    res.status(404);

    next(error);
};

export default notFound;
