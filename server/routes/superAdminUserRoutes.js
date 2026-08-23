import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createCompanyAccount } from "../controllers/superAdminUserController.js";

const router = express.Router();

// Platform user account creation must never resolve a tenant.
router.use(protect);
router.post("/accounts", createCompanyAccount);

export default router;
