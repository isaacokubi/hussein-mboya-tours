import express from "express";
import rateLimit from "express-rate-limit";
import { createPrivacyRequest, listPrivacyRequests, updatePrivacyRequest } from "../controllers/privacyController.js";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";

const router = express.Router();
const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
router.use(resolveTenant);
router.post("/requests", publicLimiter, createPrivacyRequest);
router.get("/admin/requests", protect, authorize("finance.view"), listPrivacyRequests);
router.patch("/admin/requests/:id", protect, authorize("finance.manage"), updatePrivacyRequest);
export default router;
