// server/middleware/errorHandler.js

import mongoose from "mongoose";
import multer from "multer";
import env from "../config/env.js";

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
|
| Handles:
| • Validation errors
| • Invalid ObjectIds
| • Duplicate keys
| • JWT errors
| • Multer upload errors
| • Custom application errors
|
|--------------------------------------------------------------------------
*/

const errorHandler = (err, req, res, next) => {
    console.error("ERROR:", err);

    let statusCode = err.statusCode || err.status || 500;

    let message = err.message || "Internal Server Error";

    /*
    |--------------------------------------------------------------------------
    | MONGOOSE VALIDATION ERROR
    |--------------------------------------------------------------------------
    */

    if (err instanceof mongoose.Error.ValidationError) {
        statusCode = 400;

        message = Object.values(err.errors)
            .map((item) => item.message)
            .join(", ");
    }

    /*
    |--------------------------------------------------------------------------
    | INVALID OBJECT ID
    |--------------------------------------------------------------------------
    */

    if (err instanceof mongoose.Error.CastError) {
        statusCode = 400;
        message = `Invalid ${err.path}`;
    }

    /*
    |--------------------------------------------------------------------------
    | DUPLICATE KEY
    |--------------------------------------------------------------------------
    */

    if (err.code === 11000) {
        statusCode = 409;

        const field = Object.keys(err.keyValue)[0];

        message = `${field} already exists`;
    }

    /*
    |--------------------------------------------------------------------------
    | JWT TOKEN INVALID
    |--------------------------------------------------------------------------
    */

    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid authentication token";
    }

    /*
    |--------------------------------------------------------------------------
    | JWT TOKEN EXPIRED
    |--------------------------------------------------------------------------
    */

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Authentication token has expired";
    }

    /*
    |--------------------------------------------------------------------------
    | MULTER FILE UPLOAD
    |--------------------------------------------------------------------------
    */

    if (err instanceof multer.MulterError) {
        statusCode = 400;

        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                message = "Uploaded file is too large";
                break;

            case "LIMIT_UNEXPECTED_FILE":
                message = "Unexpected file field";
                break;

            default:
                message = err.message;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | CUSTOM FILE TYPE ERROR
    |--------------------------------------------------------------------------
    */

    if (err.name === "FileTypeError") {
        statusCode = 400;
        message = err.message;
    }

    /*
    |--------------------------------------------------------------------------
    | SEND RESPONSE
    |--------------------------------------------------------------------------
    */

    res.status(statusCode).json({
        success: false,

        message,

        ...(env.NODE_ENV === "development" && {
            stack: err.stack,
        }),
    });
};

export default errorHandler;
