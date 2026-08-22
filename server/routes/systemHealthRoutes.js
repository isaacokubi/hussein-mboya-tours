import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminMiddleware);
router.use(authorize("system.security"));

const health = (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({
    success: dbReady,
    status: dbReady ? "healthy" : "degraded",
    database: dbReady ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
};

router.get("/health", health);
router.get("/admin/system-health", health);

export default router;
