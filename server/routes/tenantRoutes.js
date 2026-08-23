import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";
import { protect, superAdminOnly } from "../middleware/authMiddleware.js";
import { listTenants, createTenant, getTenant, updateTenant } from "../controllers/tenantController.js";

const router = express.Router();

router.use(resolveTenant);
router.use(protect, superAdminOnly);
router.get("/", listTenants);
router.post("/", createTenant);
router.get("/:id", getTenant);
router.patch("/:id", updateTenant);
export default router;
