import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { createAdminPackage, deleteAdminPackage, listAdminPackages, updateAdminPackage } from "../controllers/adminPackageController.js";

const router = express.Router();
router.use(resolveTenant, protect, adminMiddleware, authorize("tour.manage"));
router.get("/", listAdminPackages);
router.post("/", createAdminPackage);
router.put("/:id", updateAdminPackage);
router.delete("/:id", deleteAdminPackage);
export default router;
