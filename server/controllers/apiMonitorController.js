/**
 * Purpose: api Monitor Controller HTTP controller. Main declarations: getApiMonitor.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { getSystemSettings } from "../services/settingsService.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";

// Declare MONITORED_ENDPOINTS for use by the surrounding module or function.
const MONITORED_ENDPOINTS = [
  ["Security", "/api/superadmin/security"],
  ["Dashboard", "/api/superadmin/dashboard"],
  ["Tours", "/api/tours"],
  ["Bookings", "/api/bookings"],
];

// Declare getApiMonitor for use by the surrounding module or function.
export const getApiMonitor = async (req, res) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare settings for use by the surrounding module or function.
    const settings = await getSystemSettings();
    // Declare companyName for use by the surrounding module or function.
    const companyName = settings?.companyName || "Company";
    // Declare memory for use by the surrounding module or function.
    const memory = process.memoryUsage();
    // Declare databaseHealthy for use by the surrounding module or function.
    const databaseHealthy = mongoose.connection.readyState === 1;
    // Declare endpoints for use by the surrounding module or function.
    const endpoints = MONITORED_ENDPOINTS.map(([name, path]) => ({
      name,
      endpoint: path,
      status: databaseHealthy ? "registered" : "degraded",
      responseTime: "n/a",
    }));
    // Declare healthScore for use by the surrounding module or function.
    const healthScore = databaseHealthy ? 100 : 25;

    // Return the result of res.json() to the caller.
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
    // Perform the side effect or state update expressed on the following line.
    console.error("API MONITOR ERROR", error);
    // Return the result of res.status(500).json() to the caller.
    return res.status(500).json({ success: false, message: "Unable to load API monitor status." });
  }
};
