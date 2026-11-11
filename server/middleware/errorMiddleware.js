/**
 * Purpose: error Middleware request middleware. Main declarations: errorHandler.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/middleware/errorHandler.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load multer so this module can use its exported dependencies.
import multer from "multer";
// Load ../config/env.js so this module can use its exported dependencies.
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

// Declare errorHandler for use by the surrounding module or function.
const errorHandler = (err, req, res, next) => {
    // Perform the side effect or state update expressed on the following line.
    console.error("ERROR:", err);

    // Declare statusCode for use by the surrounding module or function.
    let statusCode = err.statusCode || err.status || 500;

    // Declare message for use by the surrounding module or function.
    let message = err.message || "Internal Server Error";

    /*
    |--------------------------------------------------------------------------
    | MONGOOSE VALIDATION ERROR
    |--------------------------------------------------------------------------
    */

    // Check the condition (err instanceof mongoose.Error.ValidationError) and run the matching branch.
    if (err instanceof mongoose.Error.ValidationError) {
        // Perform the side effect or state update expressed on the following line.
        statusCode = 400;

        // Perform the side effect or state update expressed on the following line.
        message = Object.values(err.errors)
            .map((item) => item.message)
            .join(", ");
    }

    /*
    |--------------------------------------------------------------------------
    | INVALID OBJECT ID
    |--------------------------------------------------------------------------
    */

    // Check the condition (err instanceof mongoose.Error.CastError) and run the matching branch.
    if (err instanceof mongoose.Error.CastError) {
        // Perform the side effect or state update expressed on the following line.
        statusCode = 400;
        // Perform the side effect or state update expressed on the following line.
        message = `Invalid ${err.path}`;
    }

    /*
    |--------------------------------------------------------------------------
    | DUPLICATE KEY
    |--------------------------------------------------------------------------
    */

    // Check the condition (err.code === 11000) and run the matching branch.
    if (err.code === 11000) {
        // Perform the side effect or state update expressed on the following line.
        statusCode = 409;

        // Declare field for use by the surrounding module or function.
        const field = Object.keys(err.keyValue)[0];

        // Perform the side effect or state update expressed on the following line.
        message = `${field} already exists`;
    }

    /*
    |--------------------------------------------------------------------------
    | JWT TOKEN INVALID
    |--------------------------------------------------------------------------
    */

    // Check the condition (err.name === "JsonWebTokenError") and run the matching branch.
    if (err.name === "JsonWebTokenError") {
        // Perform the side effect or state update expressed on the following line.
        statusCode = 401;
        // Perform the side effect or state update expressed on the following line.
        message = "Invalid authentication token";
    }

    /*
    |--------------------------------------------------------------------------
    | JWT TOKEN EXPIRED
    |--------------------------------------------------------------------------
    */

    // Check the condition (err.name === "TokenExpiredError") and run the matching branch.
    if (err.name === "TokenExpiredError") {
        // Perform the side effect or state update expressed on the following line.
        statusCode = 401;
        // Perform the side effect or state update expressed on the following line.
        message = "Authentication token has expired";
    }

    /*
    |--------------------------------------------------------------------------
    | MULTER FILE UPLOAD
    |--------------------------------------------------------------------------
    */

    // Check the condition (err instanceof multer.MulterError) and run the matching branch.
    if (err instanceof multer.MulterError) {
        // Perform the side effect or state update expressed on the following line.
        statusCode = 400;

        // Select the appropriate branch based on err.code.
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                // Perform the side effect or state update expressed on the following line.
                message = "Uploaded file is too large";
                // Exit the current loop or switch branch.
                break;

            case "LIMIT_UNEXPECTED_FILE":
                // Perform the side effect or state update expressed on the following line.
                message = "Unexpected file field";
                // Exit the current loop or switch branch.
                break;

            default:
                // Perform the side effect or state update expressed on the following line.
                message = err.message;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | CUSTOM FILE TYPE ERROR
    |--------------------------------------------------------------------------
    */

    // Check the condition (err.name === "FileTypeError") and run the matching branch.
    if (err.name === "FileTypeError") {
        // Perform the side effect or state update expressed on the following line.
        statusCode = 400;
        // Perform the side effect or state update expressed on the following line.
        message = err.message;
    }

    /*
    |--------------------------------------------------------------------------
    | SEND RESPONSE
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    res.status(statusCode).json({
        success: false,

        message,

        ...(env.NODE_ENV === "development" && {
            stack: err.stack,
        }),
    });
};

export default errorHandler;
