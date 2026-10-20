// Import Cloudinary's version-two SDK client for media upload/configuration.
import { v2 as cloudinary } from "cloudinary";

// List the environment variables required to authenticate with Cloudinary.
const requiredEnv = [
  "CLOUDINARY_CLOUD_NAME", // Identifies the Cloudinary account.
  "CLOUDINARY_API_KEY", // Identifies the API client.
  "CLOUDINARY_API_SECRET", // Secret used to authenticate API operations.
];

// Mark Cloudinary as configured only when every required value is present.
export const isCloudinaryConfigured = requiredEnv.every((key) => Boolean(process.env[key]));

// Configure the SDK only when credentials are complete, allowing local/test environments without media credentials to start.
if (isCloudinaryConfigured) {
  // Pass server-side credentials to the Cloudinary SDK.
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Cloudinary account name.
    api_key: process.env.CLOUDINARY_API_KEY, // Cloudinary API key.
    api_secret: process.env.CLOUDINARY_API_SECRET, // Cloudinary secret; never expose it to frontend code.
  });
}

// Keep this environment block for development-specific diagnostics; debug output is intentionally disabled.
if (process.env.NODE_ENV !== "production") {
  // debug removed
}

// Export the configured SDK client for upload services and controllers.
export default cloudinary;
