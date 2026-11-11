/**
 * Purpose: cloudinary configuration module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { v2 as cloudinary } from "cloudinary";

// Declare requiredEnv for use by the surrounding module or function.
const requiredEnv = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

// Declare isCloudinaryConfigured for use by the surrounding module or function.
export const isCloudinaryConfigured = requiredEnv.every((key) => Boolean(process.env[key]));

// Check the condition (isCloudinaryConfigured) and run the matching branch.
if (isCloudinaryConfigured) {
  // Perform the side effect or state update expressed on the following line.
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Check the condition (process.env.NODE_ENV !== "production") and run the matching branch.
if (process.env.NODE_ENV !== "production") {
  // debug removed
}

export default cloudinary;
