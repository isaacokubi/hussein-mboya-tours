/**
 * Purpose: admin Package Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/adminMiddleware.js so this module can use its exported dependencies.
import adminMiddleware from "../middleware/adminMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load ../controllers/adminPackageController.js so this module can use its exported dependencies.
import { createAdminPackage, deleteAdminPackage, listAdminPackages, updateAdminPackage } from "../controllers/adminPackageController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant, protect, adminMiddleware, authorize("tour.manage"));
// Perform the side effect or state update expressed on the following line.
router.get("/", listAdminPackages);
// Perform the side effect or state update expressed on the following line.
router.post("/", createAdminPackage);
// Perform the side effect or state update expressed on the following line.
router.put("/:id", updateAdminPackage);
// Perform the side effect or state update expressed on the following line.
router.delete("/:id", deleteAdminPackage);
export default router;
