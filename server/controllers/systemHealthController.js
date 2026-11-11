/**
 * Purpose: system Health Controller HTTP controller. Main declarations: checkCloudinary, checkMpesa, getSystemHealth, healthCheck.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { publicErrorMessage } from "../utils/publicError.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load axios so this module can use its exported dependencies.
import axios from "axios";
// Load ../config/cloudinary.js so this module can use its exported dependencies.
import cloudinary from "../config/cloudinary.js";
// Load ../services/paymentGatewayService.js so this module can use its exported dependencies.
import { getTenantMpesaConfig, getTenantMpesaUrls } from "../services/paymentGatewayService.js";

// Declare checkCloudinary for use by the surrounding module or function.
const checkCloudinary = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare configured for use by the surrounding module or function.
    const configured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
    // Check the condition (!configured) and run the matching branch.
    if (!configured) {
      // Return the object assembled below to the caller.
      return { status: "not_configured", message: "Cloudinary credentials are not configured" };
    }
    // Perform the side effect or state update expressed on the following line.
    await cloudinary.api.ping();
    // Return the object assembled below to the caller.
    return { status: "connected", message: "Cloudinary is reachable" };
  } catch (error) {
    // Return the object assembled below to the caller.
    return { status: "unavailable", message: "Cloudinary is configured but the connection check failed" };
  }
};

// Declare checkMpesa for use by the surrounding module or function.
const checkMpesa = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare config for use by the surrounding module or function.
    const config = await getTenantMpesaConfig();
    // Declare auth for use by the surrounding module or function.
    const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64");
    // Declare urls for use by the surrounding module or function.
    const urls = getTenantMpesaUrls(config);
    // Declare { data } for use by the surrounding module or function.
    const { data } = await axios.get(urls.auth, {
      timeout: 10000,
      headers: { Authorization: `Basic ${auth}` },
    });
    // Check the condition (!data?.access_token) and run the matching branch.
    if (!data?.access_token) throw new Error("M-Pesa authentication token was not returned");
    // Return the object assembled below to the caller.
    return {
      status: "connected",
      message: `M-Pesa ${config.environment || "sandbox"} gateway is reachable`,
      environment: config.environment || "sandbox",
    };
  } catch (error) {
    // Declare message for use by the surrounding module or function.
    const message = String(error?.message || "M-Pesa gateway check failed");
    // Declare notConfigured for use by the surrounding module or function.
    const notConfigured = /not configured for this tenant|configuration is incomplete|missing|credentials/i.test(message);
    // Return the object assembled below to the caller.
    return {
      status: notConfigured ? "not_configured" : "unavailable",
      message: notConfigured
        ? "M-Pesa credentials are not configured for this tenant"
        : "M-Pesa is configured but the gateway connection check failed",
    };
  }
};

// Declare getSystemHealth for use by the surrounding module or function.
export const getSystemHealth = async (req, res) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare memory for use by the surrounding module or function.
    const memory = process.memoryUsage();
    // Declare dbStatus for use by the surrounding module or function.
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    // Declare [cloudinaryCheck, mpesaCheck] for use by the surrounding module or function.
    const [cloudinaryCheck, mpesaCheck] = await Promise.all([checkCloudinary(), checkMpesa()]);
    // Declare system for use by the surrounding module or function.
    const system = {
      server: "online",
      database: dbStatus,
      cloudinary: cloudinaryCheck.status,
      mpesa: mpesaCheck.status,
      services: { cloudinary: cloudinaryCheck, mpesa: mpesaCheck },
      uptime: `${Math.floor(process.uptime())} seconds`,
      nodeVersion: process.version,
      memory: {
        rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
      },
    };
    // Return the result of res.json() to the caller.
    return res.json({ success: true, ...system, system });
  } catch (error) {
    // Return the result of res.status(500).json() to the caller.
    return res.status(500).json({ success: false, message: publicErrorMessage(error) });
  }
};

// Keep the mounted /system/admin/system-health endpoint compatible with the
// dashboard while returning the same real integration checks as /system/health.
// Declare healthCheck for use by the surrounding module or function.
export const healthCheck = async (req, res) => getSystemHealth(req, res);
