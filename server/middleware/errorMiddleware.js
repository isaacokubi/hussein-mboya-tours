// server/middleware/errorMiddleware.js — convert application errors into HTTP responses.

// Mongoose provides typed database/model validation and cast errors.
import mongoose from "mongoose";
// Multer provides typed errors for multipart file uploads.
import multer from "multer";
// Read runtime mode so detailed stack traces are restricted to development.
import env from "../config/env.js";

/*
 * Global error handler.
 * Express calls this middleware when a route or earlier middleware passes an error
 * to next(error). It maps known errors to suitable status codes and safe messages.
 */

// Handle errors that reach the end of the middleware chain.
const errorHandler = (err, req, res, next) => {
    // Log the error for diagnostics; production logging policy should redact sensitive fields.
    console.error("ERROR:", err);

    // Respect an explicit application status when present; otherwise use HTTP 500.
    let statusCode = err.statusCode || err.status || 500;

    // Start with the error's message, falling back to a generic server-error message.
    let message = err.message || "Internal Server Error";

    // Convert Mongoose field-validation failures into client-side HTTP 400 responses.
    if (err instanceof mongoose.Error.ValidationError) {
        statusCode = 400; // The request data did not satisfy the model schema.
        // Collect all field error messages into one readable response.
        message = Object.values(err.errors)
            .map((item) => item.message)
            .join(", ");
    }

    // Convert invalid MongoDB identifier casts into HTTP 400 responses.
    if (err instanceof mongoose.Error.CastError) {
        statusCode = 400; // The supplied identifier/value cannot be cast to the expected type.
        message = `Invalid ${err.path}`; // Name the invalid field without exposing internal query details.
    }

    // Treat duplicate-key errors as conflicts rather than generic server failures.
    if (err.code === 11000) {
        statusCode = 409; // A unique index rejected a duplicate value.
        const field = Object.keys(err.keyValue)[0]; // Identify the first conflicting field.
        message = `${field} already exists`; // Explain the conflict to the client.
    }

    // Return an authentication error when a JWT cannot be verified.
    if (err.name === "JsonWebTokenError") {
        statusCode = 401; // The request's token is not valid.
        message = "Invalid authentication token"; // Avoid exposing token-validation internals.
    }

    // Return a distinct authentication error when a valid JWT has expired.
    if (err.name === "TokenExpiredError") {
        statusCode = 401; // The client must authenticate again.
        message = "Authentication token has expired"; // Tell the client why authentication failed.
    }

    // Translate known multipart upload errors into clear client responses.
    if (err instanceof multer.MulterError) {
        statusCode = 400; // The uploaded file/request does not meet upload requirements.
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                message = "Uploaded file is too large"; // Explain the configured size limit was exceeded.
                break; // Stop evaluating upload error cases.
            case "LIMIT_UNEXPECTED_FILE":
                message = "Unexpected file field"; // Explain the field name was not accepted.
                break; // Stop evaluating upload error cases.
            default:
                message = err.message; // Preserve the library's message for other known Multer errors.
        }
    }

    // Handle application-defined file-type validation errors.
    if (err.name === "FileTypeError") {
        statusCode = 400; // The file type is not accepted by the upload rules.
        message = err.message; // Return the file-type validation explanation.
    }

    // Send a consistent JSON error body to the caller.
    res.status(statusCode).json({
        success: false, // Mark the operation as unsuccessful for API clients.
        message, // Return the mapped, human-readable error message.
        ...(env.NODE_ENV === "development" && {
            stack: err.stack, // Include a stack trace only during local development.
        }),
    });
};

// Register this function as Express's shared error-handling middleware.
export default errorHandler;
