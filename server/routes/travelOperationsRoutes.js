/**
 * Purpose: travel Operations Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, managerOnly } from "../middleware/authMiddleware.js";
// Load ../controllers/travelOperationsController.js so this module can use its exported dependencies.
import { listOperations, createOperation, updateOperation, deleteOperation, listRules, createRule, updateRule, deleteRule } from "../controllers/travelOperationsController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.get("/", listOperations);
// Perform the side effect or state update expressed on the following line.
router.post("/", managerOnly, createOperation);
// Perform the side effect or state update expressed on the following line.
router.patch("/:id", managerOnly, updateOperation);
// Perform the side effect or state update expressed on the following line.
router.delete("/:id", managerOnly, deleteOperation);
// Perform the side effect or state update expressed on the following line.
router.get("/rules/list", listRules);
// Perform the side effect or state update expressed on the following line.
router.post("/rules", managerOnly, createRule);
// Perform the side effect or state update expressed on the following line.
router.patch("/rules/:id", managerOnly, updateRule);
// Perform the side effect or state update expressed on the following line.
router.delete("/rules/:id", managerOnly, deleteRule);
export default router;
