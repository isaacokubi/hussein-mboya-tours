import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import contentManagerMiddleware from "../middleware/contentManagerMiddleware.js";
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.use(resolveTenant, protect, contentManagerMiddleware);
router.get("/", getAdminCategories);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
