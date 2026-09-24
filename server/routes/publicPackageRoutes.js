import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { listPublicPackages } from "../controllers/adminPackageController.js";

const router = express.Router();
router.use(resolveTenant);
router.get("/", listPublicPackages);
export default router;
