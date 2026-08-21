import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createCompanyAccount } from "../controllers/superAdminUserController.js";

const router = express.Router();

/*
 * Authentication/RBAC middleware is applied at routes/index.js.
 *
 * POST /api/superadmin/users/accounts
 */
router.post(
  "/accounts",
  protect,
  createCompanyAccount
);

export default router;
