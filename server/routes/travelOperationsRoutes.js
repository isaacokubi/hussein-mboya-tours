import express from "express";
import { protect, managerOnly } from "../middleware/authMiddleware.js";
import { listOperations, createOperation, updateOperation, deleteOperation, listRules, createRule, updateRule, deleteRule } from "../controllers/travelOperationsController.js";

const router = express.Router();
router.use(protect);
router.get("/", listOperations);
router.post("/", managerOnly, createOperation);
router.patch("/:id", managerOnly, updateOperation);
router.delete("/:id", managerOnly, deleteOperation);
router.get("/rules/list", listRules);
router.post("/rules", managerOnly, createRule);
router.patch("/rules/:id", managerOnly, updateRule);
router.delete("/rules/:id", managerOnly, deleteRule);
export default router;
