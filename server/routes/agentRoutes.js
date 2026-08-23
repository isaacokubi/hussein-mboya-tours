import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { getAgentDashboard, getAgentBookings, getAgentCustomers, getMyAgentCommission } from "../controllers/agentController.js";
import { getAgentQuotations } from "../controllers/quotationController.js";
import { createAgentTour, getAgentTours, getAgentTour, updateAgentTour, deleteAgentTour } from "../controllers/agentTourController.js";
import { protect } from "../middleware/authMiddleware.js";
import agentMiddleware, { requireApprovedAgent } from "../middleware/agentMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Always authenticate first so tenant resolution is based on the authoritative
// database user rather than an unauthenticated tenant header.
router.use(protect);
router.use(resolveTenant);
router.use(agentMiddleware);

router.get("/dashboard", getAgentDashboard);
router.use(requireApprovedAgent);

router.get("/bookings", getAgentBookings);
router.get("/customers", getAgentCustomers);
router.get("/quotes", getAgentQuotations);
router.get("/commission", getMyAgentCommission);

router.get("/tours", authorize("view_agent_tours"), getAgentTours);
router.get("/tours/:id", authorize("view_agent_tours"), getAgentTour);
router.post("/tours", authorize("create_agent_tour"), upload.array("images", 10), createAgentTour);
router.put("/tours/:id", authorize("edit_agent_tour"), upload.array("images", 10), updateAgentTour);
router.delete("/tours/:id", authorize("delete_agent_tour"), deleteAgentTour);

export default router;
