/**
 * Purpose: developer Integration Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, checkPermission } from "../middleware/authMiddleware.js";
// Load ../controllers/developerIntegrationController.js so this module can use its exported dependencies.
import { listApiKeys, createApiKey, revokeApiKey, listWebhooks, createWebhook, updateWebhook, testWebhook, deleteWebhook } from "../controllers/developerIntegrationController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant, protect, checkPermission("system.security"));
// Perform the side effect or state update expressed on the following line.
router.get("/api-keys", listApiKeys);
// Perform the side effect or state update expressed on the following line.
router.post("/api-keys", createApiKey);
// Perform the side effect or state update expressed on the following line.
router.post("/api-keys/:id/revoke", revokeApiKey);
// Perform the side effect or state update expressed on the following line.
router.get("/webhooks", listWebhooks);
// Perform the side effect or state update expressed on the following line.
router.post("/webhooks", createWebhook);
// Perform the side effect or state update expressed on the following line.
router.patch("/webhooks/:id", updateWebhook);
// Perform the side effect or state update expressed on the following line.
router.post("/webhooks/:id/test", testWebhook);
// Perform the side effect or state update expressed on the following line.
router.delete("/webhooks/:id", deleteWebhook);

export default router;
