// server/middleware/uploadMiddleware.js

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

/*
|--------------------------------------------------------------------------
| CLOUDINARY STORAGE
|--------------------------------------------------------------------------
*/

const storage = new CloudinaryStorage({
    cloudinary,

    params: async (req, file) => {
        const isImage = file.mimetype.startsWith("image/");

        return {
            folder: "global-tours",

            resource_type: "auto",

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
});

/*
|--------------------------------------------------------------------------
| FILE FILTER
|--------------------------------------------------------------------------
*/

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
];

const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        return cb(null, true);
    }

    cb(
        new Error(
            "Only JPG, PNG, WEBP images and PDF files are allowed."
        ),
        false
    );
};

/*
|--------------------------------------------------------------------------
| MULTER INSTANCE
|--------------------------------------------------------------------------
*/

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
        files: 10,
        fields: 30,
        fieldNameSize: 100,
        fieldSize: 256 * 1024,
        fieldNestingDepth: 5,
    },

    fileFilter,
});

/*
|--------------------------------------------------------------------------
| COMMON EXPORTS
|--------------------------------------------------------------------------
*/

export const uploadSingle = (field = "image") =>
    upload.single(field);

export const uploadMultiple = (field = "images", max = 10) =>
    upload.array(field, max);

export const uploadFields = (fields) =>
    upload.fields(fields);

export default upload;