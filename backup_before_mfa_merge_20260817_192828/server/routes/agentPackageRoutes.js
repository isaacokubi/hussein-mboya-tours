// server/routes/agentPackageRoutes.js

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import agentMiddleware from "../middleware/agentMiddleware.js";
import { getAgentPackages, getPackageDetails } from "../controllers/agentPackageController.js";

const router = express.Router();

router.use(protect);
router.use(agentMiddleware);

router.get("/", getAgentPackages);
router.get("/:id", getPackageDetails);

export default router;
