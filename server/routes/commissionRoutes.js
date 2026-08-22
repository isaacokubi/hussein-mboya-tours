import { authorize } from "../middleware/permissionMiddleware.js";
import express from "express";

import {
getCommissions,
getAgentCommissions,
approveCommission,
payCommission
} from "../controllers/commissionController.js";


import {
protect
} from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";


const router = express.Router();



router.use(protect);
router.use(adminMiddleware);

router.use(authorize("commission.view"));

router.get(
"/",
getCommissions
);



router.get(
"/agent/:agentId",
getAgentCommissions
);

router.patch("/:id/approve", adminMiddleware, approveCommission);
router.post("/:id/pay", adminMiddleware, payCommission);



export default router;
