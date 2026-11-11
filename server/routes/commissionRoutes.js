/**
 * Purpose: commission Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";

// Load ../controllers/commissionController.js so this module can use its exported dependencies.
import {
getCommissions,
getAgentCommissions,
approveCommission,
payCommission
} from "../controllers/commissionController.js";


// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import {
protect
} from "../middleware/authMiddleware.js";
// Load ../middleware/adminMiddleware.js so this module can use its exported dependencies.
import adminMiddleware from "../middleware/adminMiddleware.js";


// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);



// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(adminMiddleware);

// Perform the side effect or state update expressed on the following line.
router.use(authorize("commission.view"));

// Perform the side effect or state update expressed on the following line.
router.get(
"/",
getCommissions
);



// Perform the side effect or state update expressed on the following line.
router.get(
"/agent/:agentId",
getAgentCommissions
);

// Perform the side effect or state update expressed on the following line.
router.patch("/:id/approve", adminMiddleware, approveCommission);
// Perform the side effect or state update expressed on the following line.
router.post("/:id/pay", adminMiddleware, payCommission);



export default router;
