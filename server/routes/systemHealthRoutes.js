import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import cloudinary from "../config/cloudinary.js";
import { mpesaConfig, getMpesaUrls } from "../config/mpesa.js";
import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.use(resolveTenant);
router.use(protect);
router.use(adminMiddleware);
router.use(authorize("system.security"));

const checkCloudinary = async () => {
  const startedAt = Date.now();
  try {
    await cloudinary.api.ping();
    return { status: "online", message: "Cloudinary API reachable", latencyMs: Date.now() - startedAt };
  } catch (error) {
    return { status: "degraded", message: error?.message || "Cloudinary API check failed", latencyMs: Date.now() - startedAt };
  }
};

const checkMpesa = async () => {
  const startedAt = Date.now();
  try {
    const credentials = Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString("base64");
    const response = await axios.get(getMpesaUrls().auth, {
      headers: { Authorization: `Basic ${credentials}` },
      timeout: 8000,
      validateStatus: () => true,
    });

    if (response.status >= 200 && response.status < 300 && response.data?.access_token) {
      return { status: "online", message: "M-Pesa gateway authentication successful", environment: mpesaConfig.environment, latencyMs: Date.now() - startedAt };
    }

    return {
      status: "degraded",
      message: response.data?.error_description || response.data?.errorMessage || `Gateway returned HTTP ${response.status}`,
      environment: mpesaConfig.environment,
      latencyMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      status: "degraded",
      message: error?.message || "M-Pesa gateway check failed",
      environment: mpesaConfig.environment,
      latencyMs: Date.now() - startedAt,
    };
  }
};

const health = async (req, res) => {
  const startedAt = Date.now();
  const dbReady = mongoose.connection.readyState === 1;
  const [cloudinaryHealth, mpesaHealth] = await Promise.all([checkCloudinary(), checkMpesa()]);
  const allHealthy = dbReady && cloudinaryHealth.status === "online" && mpesaHealth.status === "online";

  return res.status(200).json({
    success: true,
    status: allHealthy ? "healthy" : "degraded",
    database: dbReady ? "connected" : "disconnected",
    services: {
      database: { status: dbReady ? "online" : "offline", message: dbReady ? "MongoDB connection is healthy" : "MongoDB connection is unavailable" },
      api: { status: "online", message: "API server is responding" },
      cloudinary: cloudinaryHealth,
      mpesa: mpesaHealth,
    },
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
  });
};

router.get("/health", health);
router.get("/admin/system-health", health);

export default router;
