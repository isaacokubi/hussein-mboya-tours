/**
 * Purpose: agent Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../controllers/agentController.js so this module can use its exported dependencies.
import { getAgentDashboard, getAgentBookings, getAgentCustomers, getMyAgentCommission } from "../controllers/agentController.js";
// Load ../controllers/quotationController.js so this module can use its exported dependencies.
import { getAgentQuotations } from "../controllers/quotationController.js";
// Load ../controllers/agentTourController.js so this module can use its exported dependencies.
import { createAgentTour, getAgentTours, getAgentTour, updateAgentTour, deleteAgentTour } from "../controllers/agentTourController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/agentMiddleware.js so this module can use its exported dependencies.
import agentMiddleware, { requireApprovedAgent } from "../middleware/agentMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load ../middleware/uploadMiddleware.js so this module can use its exported dependencies.
import upload from "../middleware/uploadMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Always authenticate first so tenant resolution is based on the authoritative
// database user rather than an unauthenticated tenant header.
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.use(agentMiddleware);

// Perform the side effect or state update expressed on the following line.
router.get("/dashboard", getAgentDashboard);
// Perform the side effect or state update expressed on the following line.
router.use(requireApprovedAgent);

// Perform the side effect or state update expressed on the following line.
router.get("/bookings", getAgentBookings);
// Perform the side effect or state update expressed on the following line.
router.get("/customers", getAgentCustomers);
// Perform the side effect or state update expressed on the following line.
router.get("/quotes", getAgentQuotations);
// Perform the side effect or state update expressed on the following line.
router.get("/commission", getMyAgentCommission);

// Perform the side effect or state update expressed on the following line.
router.get("/tours", authorize("view_agent_tours"), getAgentTours);
// Perform the side effect or state update expressed on the following line.
router.get("/tours/:id", authorize("view_agent_tours"), getAgentTour);
// Perform the side effect or state update expressed on the following line.
router.post("/tours", authorize("create_agent_tour"), upload.array("images", 10), createAgentTour);
// Perform the side effect or state update expressed on the following line.
router.put("/tours/:id", authorize("edit_agent_tour"), upload.array("images", 10), updateAgentTour);
// Perform the side effect or state update expressed on the following line.
router.delete("/tours/:id", authorize("delete_agent_tour"), deleteAgentTour);

export default router;
