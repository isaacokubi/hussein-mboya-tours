import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import { listApiKeys,createApiKey,revokeApiKey,listWebhooks,createWebhook,updateWebhook,deleteWebhook } from "../controllers/developerIntegrationController.js";
const router=express.Router();
router.use(resolveTenant,protect,checkPermission("system.security"));
router.get("/api-keys",listApiKeys);router.post("/api-keys",createApiKey);router.post("/api-keys/:id/revoke",revokeApiKey);
router.get("/webhooks",listWebhooks);router.post("/webhooks",createWebhook);router.patch("/webhooks/:id",updateWebhook);router.delete("/webhooks/:id",deleteWebhook);
export default router;
