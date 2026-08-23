import { getSystemSettings } from "../services/settingsService.js";
import mongoose from "mongoose";

const MONITORED_ENDPOINTS = [
  ["Security", "/api/superadmin/security"],
  ["Dashboard", "/api/superadmin/dashboard"],
  ["Tours", "/api/tours"],
  ["Bookings", "/api/bookings"],
];

export const getApiMonitor = async (req, res) => {
  try {
    const settings = await getSystemSettings();
    const companyName = settings?.companyName || "Company";
    const memory = process.memoryUsage();
    const databaseHealthy = mongoose.connection.readyState === 1;
    const endpoints = MONITORED_ENDPOINTS.map(([name, path]) => ({
      name,
      endpoint: path,
      status: databaseHealthy ? "registered" : "degraded",
      responseTime: "n/a",
    }));
    const healthScore = databaseHealthy ? 100 : 25;

    return res.json({
      success: true,
      data: {
        status: databaseHealthy ? "online" : "degraded",
        service: `${companyName} API`,
        healthScore,
        database: { status: databaseHealthy ? "Connected" : "Disconnected" },
        response: databaseHealthy ? "normal" : "degraded",
        server: {
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || "development",
          uptime: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
          memory: {
            used: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
            total: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
          },
        },
        endpoints,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("API MONITOR ERROR", error);
    return res.status(500).json({ success: false, message: "Unable to load API monitor status." });
  }
};
