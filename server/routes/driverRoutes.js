// server/routes/driverRoutes.js

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { driverDashboard } from "../controllers/driverController.js";

const router = express.Router();

router.use(protect);

router.get("/dashboard", (req, res, next) => {
  const role = String(
    req.user?.roleId?.name || req.user?.role || req.user?.legacyRole || ""
  ).toLowerCase().replace(/[\s_-]+/g, "");

  if (!["driver", "admin", "superadmin", "administrator"].includes(role)) {
    return res.status(403).json({
      success: false,
      message: "Driver access required.",
    });
  }

  return driverDashboard(req, res, next);
});

export default router;
