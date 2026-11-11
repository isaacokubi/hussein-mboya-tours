/**
 * Purpose: upload Middleware request middleware. Main declarations: fileFilter, unavailableFileFilter, cloudinaryUnavailable, createUploadMiddleware, uploadSingle.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/middleware/uploadMiddleware.js

// Load multer so this module can use its exported dependencies.
import multer from "multer";
// Load multer-storage-cloudinary so this module can use its exported dependencies.
import { CloudinaryStorage } from "multer-storage-cloudinary";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load ../config/cloudinary.js so this module can use its exported dependencies.
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

/*
|--------------------------------------------------------------------------
| CLOUDINARY STORAGE
|--------------------------------------------------------------------------
*/

// Declare storage for use by the surrounding module or function.
const storage = isCloudinaryConfigured ? new CloudinaryStorage({
    cloudinary,

    params: async (req, file) => {
        // Declare isImage for use by the surrounding module or function.
        const isImage = file.mimetype.startsWith("image/");

        // Return the object assembled below to the caller.
        return {
            folder: `global-tours/${String(req.tenantId || req.tenant?._id || "public")}`,

            resource_type: file.mimetype === "application/pdf" ? "raw" : "image",

            public_id: `${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}`,

            format: undefined,

            transformation: isImage
                ? [
                      {
                          width: 1200,
                          height: 800,
                          crop: "fill",
                          quality: "auto",
                          fetch_format: "auto",
                      },
                  ]
                : undefined,
        };
    },
}) : null;

/*
|--------------------------------------------------------------------------
| FILE FILTER
|--------------------------------------------------------------------------
*/

// Declare allowedFileTypes for use by the surrounding module or function.
const allowedFileTypes = new Map([
    [".jpg", "image/jpeg"],
    [".jpeg", "image/jpeg"],
    [".png", "image/png"],
    [".webp", "image/webp"],
    [".pdf", "application/pdf"],
]);

// Declare fileFilter for use by the surrounding module or function.
const fileFilter = (req, file, cb) => {
    // Declare originalName for use by the surrounding module or function.
    const originalName = String(file.originalname || "");
    // Declare extension for use by the surrounding module or function.
    const extension = path.extname(originalName).toLowerCase();
    // Declare expectedMime for use by the surrounding module or function.
    const expectedMime = allowedFileTypes.get(extension);

    // Check the condition (!expectedMime || expectedMime !== String(file.mimetype || "").toLowerC) and run the matching branch.
    if (!expectedMime || expectedMime !== String(file.mimetype || "").toLowerCase()) {
        // Return the result of cb() to the caller.
        return cb(
            new Error("File type and extension do not match. Only JPG, PNG, WEBP images and PDF files are allowed."),
            false
        );
    }

    // Check the condition (/[\u0000-\u001f\u007f]/.test(originalName) || originalName.length > 18) and run the matching branch.
    if (/[\u0000-\u001f\u007f]/.test(originalName) || originalName.length > 180) {
        // Return the result of cb() to the caller.
        return cb(new Error("The uploaded filename is invalid."), false);
    }

    // Return the result of cb() to the caller.
    return cb(null, true);
};

// Declare unavailableFileFilter for use by the surrounding module or function.
const unavailableFileFilter = (req, file, cb) => {
    // Perform the side effect or state update expressed on the following line.
    fileFilter(req, file, (error, accepted) => {
        // Check the condition (error || !accepted) and run the matching branch.
        if (error || !accepted) return cb(error, accepted);
        // Declare unavailable for use by the surrounding module or function.
        const unavailable = new Error("File uploads are unavailable because Cloudinary is not configured.");
        // Perform the side effect or state update expressed on the following line.
        unavailable.statusCode = 503;
        // Perform the side effect or state update expressed on the following line.
        unavailable.expose = true;
        // Return the result of cb() to the caller.
        return cb(unavailable);
    });
};

// Declare uploadLimits for use by the surrounding module or function.
const uploadLimits = {
    fileSize: 5 * 1024 * 1024,
    files: 10,
    fields: 30,
    fieldNameSize: 100,
    fieldSize: 256 * 1024,
    fieldNestingDepth: 5,
};

/*
|--------------------------------------------------------------------------
| MULTER INSTANCE
|--------------------------------------------------------------------------
*/

// Declare upload for use by the surrounding module or function.
const upload = isCloudinaryConfigured ? multer({
    storage,

    limits: uploadLimits,

    fileFilter,
}) : null;

// Declare cloudinaryUnavailable for use by the surrounding module or function.
const cloudinaryUnavailable = (req, res) => res.status(503).json({
    success: false,
    message: "File uploads are unavailable because Cloudinary is not configured.",
});

// Declare createUploadMiddleware for use by the surrounding module or function.
const createUploadMiddleware = (method, ...args) => {
    // Check the condition (isCloudinaryConfigured) and run the matching branch.
    if (isCloudinaryConfigured) return upload[method](...args);

    // Declare fieldsParser for use by the surrounding module or function.
    const fieldsParser = multer({
        storage: multer.memoryStorage(),
        limits: uploadLimits,
        fileFilter: unavailableFileFilter,
    })[method](...args);

    // Return the expression shown below to the caller.
    return (req, res, next) => {
        // Check the condition (!req.is("multipart/form-data")) and run the matching branch.
        if (!req.is("multipart/form-data")) return next();
        // Return the result of fieldsParser() to the caller.
        return fieldsParser(req, res, next);
    };
};

/*
|--------------------------------------------------------------------------
| COMMON EXPORTS
|--------------------------------------------------------------------------
*/

// Declare uploadSingle for use by the surrounding module or function.
export const uploadSingle = (field = "image") =>
    createUploadMiddleware("single", field);

// Declare uploadMultiple for use by the surrounding module or function.
export const uploadMultiple = (field = "images", max = 10) =>
    createUploadMiddleware("array", field, max);

// Declare uploadFields for use by the surrounding module or function.
export const uploadFields = (fields) =>
    createUploadMiddleware("fields", fields);

export default {
    single: (field) => uploadSingle(field),
    array: (field, max) => uploadMultiple(field, max),
    fields: (fields) => uploadFields(fields),
};
