import express from "express";
import {
    getBranding,
    updateBranding
} from "../controllers/tenantBrandingController.js";

import { resolveTenant } from "../middleware/tenantMiddleware.js";

const router = express.Router();

router.use(resolveTenant);

router.get(
    "/",
    getBranding
);

router.put(
    "/",
    updateBranding
);

export default router;
