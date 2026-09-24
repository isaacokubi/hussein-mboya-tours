// server/middleware/uploadMiddleware.js

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "node:path";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

/*
|--------------------------------------------------------------------------
| CLOUDINARY STORAGE
|--------------------------------------------------------------------------
*/

const storage = isCloudinaryConfigured ? new CloudinaryStorage({
    cloudinary,

    params: async (req, file) => {
        const isImage = file.mimetype.startsWith("image/");

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

const allowedFileTypes = new Map([
    [".jpg", "image/jpeg"],
    [".jpeg", "image/jpeg"],
    [".png", "image/png"],
    [".webp", "image/webp"],
    [".pdf", "application/pdf"],
]);

const fileFilter = (req, file, cb) => {
    const originalName = String(file.originalname || "");
    const extension = path.extname(originalName).toLowerCase();
    const expectedMime = allowedFileTypes.get(extension);

    if (!expectedMime || expectedMime !== String(file.mimetype || "").toLowerCase()) {
        return cb(
            new Error("File type and extension do not match. Only JPG, PNG, WEBP images and PDF files are allowed."),
            false
        );
    }

    if (/[\u0000-\u001f\u007f]/.test(originalName) || originalName.length > 180) {
        return cb(new Error("The uploaded filename is invalid."), false);
    }

    return cb(null, true);
};

const unavailableFileFilter = (req, file, cb) => {
    fileFilter(req, file, (error, accepted) => {
        if (error || !accepted) return cb(error, accepted);
        const unavailable = new Error("File uploads are unavailable because Cloudinary is not configured.");
        unavailable.statusCode = 503;
        unavailable.expose = true;
        return cb(unavailable);
    });
};

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

const upload = isCloudinaryConfigured ? multer({
    storage,

    limits: uploadLimits,

    fileFilter,
}) : null;

const cloudinaryUnavailable = (req, res) => res.status(503).json({
    success: false,
    message: "File uploads are unavailable because Cloudinary is not configured.",
});

const createUploadMiddleware = (method, ...args) => {
    if (isCloudinaryConfigured) return upload[method](...args);

    const fieldsParser = multer({
        storage: multer.memoryStorage(),
        limits: uploadLimits,
        fileFilter: unavailableFileFilter,
    })[method](...args);

    return (req, res, next) => {
        if (!req.is("multipart/form-data")) return next();
        return fieldsParser(req, res, next);
    };
};

/*
|--------------------------------------------------------------------------
| COMMON EXPORTS
|--------------------------------------------------------------------------
*/

export const uploadSingle = (field = "image") =>
    createUploadMiddleware("single", field);

export const uploadMultiple = (field = "images", max = 10) =>
    createUploadMiddleware("array", field, max);

export const uploadFields = (fields) =>
    createUploadMiddleware("fields", fields);

export default {
    single: (field) => uploadSingle(field),
    array: (field, max) => uploadMultiple(field, max),
    fields: (fields) => uploadFields(fields),
};
