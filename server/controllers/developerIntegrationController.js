/**
 * Purpose: developer Integration Controller HTTP controller. Main declarations: tenantId, keyView, listApiKeys, createApiKey, revokeApiKey.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import crypto from "crypto";
// Load ../models/ApiKey.js so this module can use its exported dependencies.
import ApiKey from "../models/ApiKey.js";
// Load ../models/Webhook.js so this module can use its exported dependencies.
import Webhook from "../models/Webhook.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../services/jobQueueService.js so this module can use its exported dependencies.
import { enqueueJob } from "../services/jobQueueService.js";
// Load ../services/webhookDeliveryService.js so this module can use its exported dependencies.
import { protectWebhookSecret, validateWebhookUrl } from "../services/webhookDeliveryService.js";

// Declare tenantId for use by the surrounding module or function.
const tenantId = (req) => req.tenant?.tenantId || req.tenant?.id || req.user?.tenantId;
// Declare keyView for use by the surrounding module or function.
const keyView = (item) => ({ _id: item._id, name: item.name, prefix: item.prefix, scopes: item.scopes, expiresAt: item.expiresAt, lastUsedAt: item.lastUsedAt, revokedAt: item.revokedAt, createdAt: item.createdAt });
// Declare allowedEvents for use by the surrounding module or function.
const allowedEvents = new Set(["booking.created", "booking.updated", "payment.completed", "payment.failed", "invoice.created", "invoice.updated"]);

// Declare listApiKeys for use by the surrounding module or function.
export const listApiKeys = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try { res.json({ success: true, data: await ApiKey.find(tenantFilter(req)).sort({ createdAt: -1 }).lean().then((x) => x.map(keyView)) }); } catch (e) { next(e); }
};

// Declare createApiKey for use by the surrounding module or function.
export const createApiKey = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare raw for use by the surrounding module or function.
    const raw = `gt_${crypto.randomBytes(30).toString("base64url")}`;
    // Declare doc for use by the surrounding module or function.
    const doc = await ApiKey.create({ tenantId: tenantId(req), name: String(req.body?.name || "API key").trim(), prefix: raw.slice(0, 11), secretHash: ApiKey.hashSecret(raw), scopes: Array.isArray(req.body?.scopes) && req.body.scopes.length ? req.body.scopes : ["read"], expiresAt: req.body?.expiresAt || null, createdBy: req.user?._id || null });
    // Perform the side effect or state update expressed on the following line.
    res.status(201).json({ success: true, data: { ...keyView(doc.toObject()), secret: raw } });
  } catch (e) { next(e); }
};

// Declare revokeApiKey for use by the surrounding module or function.
export const revokeApiKey = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try { const doc = await ApiKey.findOneAndUpdate({ ...tenantFilter(req), _id: req.params.id }, { revokedAt: new Date() }, { new: true }); if (!doc) return res.status(404).json({ success: false, message: "API key not found." }); res.json({ success: true, data: keyView(doc.toObject()) }); } catch (e) { next(e); }
};

// Declare listWebhooks for use by the surrounding module or function.
export const listWebhooks = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try { res.json({ success: true, data: await Webhook.find(tenantFilter(req)).select("-secret").sort({ createdAt: -1 }).lean() }); } catch (e) { next(e); }
};

// Declare createWebhook for use by the surrounding module or function.
export const createWebhook = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare url for use by the surrounding module or function.
    const url = await validateWebhookUrl(req.body?.url);
    // Declare requestedEvents for use by the surrounding module or function.
    const requestedEvents = Array.isArray(req.body?.events) ? req.body.events.map(String).filter((event) => allowedEvents.has(event)) : [];
    // Check the condition (Array.isArray(req.body?.events) && requestedEvents.length !== req.body) and run the matching branch.
    if (Array.isArray(req.body?.events) && requestedEvents.length !== req.body.events.length) return res.status(400).json({ success: false, message: "Webhook contains unsupported event types." });
    // Declare secret for use by the surrounding module or function.
    const secret = crypto.randomBytes(32).toString("hex");
    // Declare doc for use by the surrounding module or function.
    const doc = await Webhook.create({ tenantId: tenantId(req), name: String(req.body?.name || "Webhook").trim(), url, secret: await protectWebhookSecret(secret), events: requestedEvents.length ? requestedEvents : undefined });
    // Perform the side effect or state update expressed on the following line.
    res.status(201).json({ success: true, data: { ...doc.toObject(), secret } });
  } catch (e) { if (/Webhook URL|private|local|resolves|credentials/i.test(String(e.message))) return res.status(400).json({ success: false, message: e.message }); next(e); }
};

// Declare updateWebhook for use by the surrounding module or function.
export const updateWebhook = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare patch for use by the surrounding module or function.
    const patch = {};
    // Check the condition (req.body?.name !== undefined) and run the matching branch.
    if (req.body?.name !== undefined) patch.name = String(req.body.name).trim();
    // Check the condition (req.body?.url !== undefined) and run the matching branch.
    if (req.body?.url !== undefined) patch.url = await validateWebhookUrl(req.body.url);
    // Check the condition (req.body?.events !== undefined) and run the matching branch.
    if (req.body?.events !== undefined) {
      // Check the condition (!Array.isArray(req.body.events) || req.body.events.some((event) => !al) and run the matching branch.
      if (!Array.isArray(req.body.events) || req.body.events.some((event) => !allowedEvents.has(String(event)))) return res.status(400).json({ success: false, message: "Webhook contains unsupported event types." });
      // Perform the side effect or state update expressed on the following line.
      patch.events = req.body.events.map(String);
    }
    // Check the condition (req.body?.active !== undefined) and run the matching branch.
    if (req.body?.active !== undefined) patch.active = Boolean(req.body.active);
    // Declare doc for use by the surrounding module or function.
    const doc = await Webhook.findOneAndUpdate({ ...tenantFilter(req), _id: req.params.id }, patch, { new: true, runValidators: true }).select("-secret");
    // Check the condition (!doc) and run the matching branch.
    if (!doc) return res.status(404).json({ success: false, message: "Webhook not found." });
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, data: doc });
  } catch (e) { if (/Webhook URL|private|local|resolves|credentials/i.test(String(e.message))) return res.status(400).json({ success: false, message: e.message }); next(e); }
};

// Declare testWebhook for use by the surrounding module or function.
export const testWebhook = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare hook for use by the surrounding module or function.
    const hook = await Webhook.findOne({ ...tenantFilter(req), _id: req.params.id }).select("_id events active").lean();
    // Check the condition (!hook) and run the matching branch.
    if (!hook) return res.status(404).json({ success: false, message: "Webhook not found." });
    // Check the condition (!hook.active) and run the matching branch.
    if (!hook.active) return res.status(409).json({ success: false, message: "Activate the webhook before sending a test delivery." });
    // Declare event for use by the surrounding module or function.
    const event = hook.events?.[0];
    // Check the condition (!event) and run the matching branch.
    if (!event) return res.status(409).json({ success: false, message: "Select at least one webhook event before testing delivery." });
    // Declare eventId for use by the surrounding module or function.
    const eventId = crypto.randomUUID();
    // Declare job for use by the surrounding module or function.
    const job = await enqueueJob("webhook.delivery", {
      webhookId: hook._id,
      event,
      eventId,
      occurredAt: new Date().toISOString(),
      data: {
        test: true,
        message: "This is a test delivery from Global Tours.",
        sentAt: new Date().toISOString(),
      },
    }, {
      tenantId: tenantId(req),
      idempotencyKey: `webhook-test:${hook._id}:${eventId}`,
      maxAttempts: 3,
    });
    // Perform the side effect or state update expressed on the following line.
    res.status(202).json({ success: true, message: "Webhook test queued for delivery.", jobId: job?._id || job?.id || null, event, eventId });
  } catch (e) { next(e); }
};

// Declare deleteWebhook for use by the surrounding module or function.
export const deleteWebhook = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try { const doc = await Webhook.findOneAndDelete({ ...tenantFilter(req), _id: req.params.id }); if (!doc) return res.status(404).json({ success: false, message: "Webhook not found." }); res.json({ success: true, message: "Webhook deleted." }); } catch (e) { next(e); }
};
