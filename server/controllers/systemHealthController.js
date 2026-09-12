import mongoose from "mongoose";
import axios from "axios";
import cloudinary from "../config/cloudinary.js";
import { getTenantMpesaConfig, getTenantMpesaUrls } from "../services/paymentGatewayService.js";

const checkCloudinary = async () => {
  try {
    await cloudinary.api.ping();
    return { status: "connected", message: "Cloudinary is reachable" };
  } catch (error) {
    return { status: "unavailable", message: "Cloudinary connection failed" };
  }
};

const checkMpesa = async () => {
  try {
    const config = await getTenantMpesaConfig();
    const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64");
    const urls = getTenantMpesaUrls(config);
    const { data } = await axios.get(urls.auth, {
      timeout: 10000,
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!data?.access_token) throw new Error("M-Pesa authentication token was not returned");
    return { status: "connected", message: `M-Pesa ${config.environment || "sandbox"} gateway is reachable`, environment: config.environment || "sandbox" };
  } catch (error) {
    const message = error?.message || "M-Pesa gateway check failed";
    return { status: "unavailable", message: message.length > 120 ? "M-Pesa gateway check failed" : message };
  }
};

export const getSystemHealth = async (req, res) => {
  try {
    const memory = process.memoryUsage();
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    const [cloudinaryCheck, mpesaCheck] = await Promise.all([checkCloudinary(), checkMpesa()]);
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
    return res.json({ success: true, ...system, system });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const healthCheck = async (req, res) => {
  res.json({ success: true, message: "Module operational" });
};
