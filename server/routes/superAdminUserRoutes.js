/**
 * Purpose: super Admin User Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../controllers/superAdminUserController.js so this module can use its exported dependencies.
import { createCompanyAccount } from "../controllers/superAdminUserController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Platform user account creation must never resolve a tenant.
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.post("/accounts", createCompanyAccount);

export default router;
