import crypto from "crypto";
import ApiKey from "../models/ApiKey.js";
import Webhook from "../models/Webhook.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import { protectWebhookSecret, validateWebhookUrl } from "../services/webhookDeliveryService.js";

const tenantId = (req) => req.tenant?.tenantId || req.tenant?.id || req.user?.tenantId;
const keyView = (item) => ({ _id: item._id, name: item.name, prefix: item.prefix, scopes: item.scopes, expiresAt: item.expiresAt, lastUsedAt: item.lastUsedAt, revokedAt: item.revokedAt, createdAt: item.createdAt });
const allowedEvents = new Set(["booking.created", "booking.updated", "payment.completed", "payment.failed", "invoice.created", "invoice.updated"]);

export const listApiKeys = async (req, res, next) => {
  try { res.json({ success: true, data: await ApiKey.find(tenantFilter(req)).sort({ createdAt: -1 }).lean().then((x) => x.map(keyView)) }); } catch (e) { next(e); }
};

export const createApiKey = async (req, res, next) => {
  try {
    const raw = `gt_${crypto.randomBytes(30).toString("base64url")}`;
    const doc = await ApiKey.create({ tenantId: tenantId(req), name: String(req.body?.name || "API key").trim(), prefix: raw.slice(0, 11), secretHash: ApiKey.hashSecret(raw), scopes: Array.isArray(req.body?.scopes) && req.body.scopes.length ? req.body.scopes : ["read"], expiresAt: req.body?.expiresAt || null, createdBy: req.user?._id || null });
    res.status(201).json({ success: true, data: { ...keyView(doc.toObject()), secret: raw } });
  } catch (e) { next(e); }
};

export const revokeApiKey = async (req, res, next) => {
  try { const doc = await ApiKey.findOneAndUpdate({ ...tenantFilter(req), _id: req.params.id }, { revokedAt: new Date() }, { new: true }); if (!doc) return res.status(404).json({ success: false, message: "API key not found." }); res.json({ success: true, data: keyView(doc.toObject()) }); } catch (e) { next(e); }
};

export const listWebhooks = async (req, res, next) => {
  try { res.json({ success: true, data: await Webhook.find(tenantFilter(req)).select("-secret").sort({ createdAt: -1 }).lean() }); } catch (e) { next(e); }
};

export const createWebhook = async (req, res, next) => {
  try {
    const url = await validateWebhookUrl(req.body?.url);
    const requestedEvents = Array.isArray(req.body?.events) ? req.body.events.map(String).filter((event) => allowedEvents.has(event)) : [];
    if (Array.isArray(req.body?.events) && requestedEvents.length !== req.body.events.length) return res.status(400).json({ success: false, message: "Webhook contains unsupported event types." });
    const secret = crypto.randomBytes(32).toString("hex");
    const doc = await Webhook.create({ tenantId: tenantId(req), name: String(req.body?.name || "Webhook").trim(), url, secret: await protectWebhookSecret(secret), events: requestedEvents.length ? requestedEvents : undefined });
    res.status(201).json({ success: true, data: { ...doc.toObject(), secret } });
  } catch (e) { if (/Webhook URL|private|local|resolves|credentials/i.test(String(e.message))) return res.status(400).json({ success: false, message: e.message }); next(e); }
};

export const updateWebhook = async (req, res, next) => {
  try {
    const patch = {};
    if (req.body?.name !== undefined) patch.name = String(req.body.name).trim();
    if (req.body?.url !== undefined) patch.url = await validateWebhookUrl(req.body.url);
    if (req.body?.events !== undefined) {
      if (!Array.isArray(req.body.events) || req.body.events.some((event) => !allowedEvents.has(String(event)))) return res.status(400).json({ success: false, message: "Webhook contains unsupported event types." });
      patch.events = req.body.events.map(String);
    }
    if (req.body?.active !== undefined) patch.active = Boolean(req.body.active);
    const doc = await Webhook.findOneAndUpdate({ ...tenantFilter(req), _id: req.params.id }, patch, { new: true, runValidators: true }).select("-secret");
    if (!doc) return res.status(404).json({ success: false, message: "Webhook not found." });
    res.json({ success: true, data: doc });
  } catch (e) { if (/Webhook URL|private|local|resolves|credentials/i.test(String(e.message))) return res.status(400).json({ success: false, message: e.message }); next(e); }
};

export const deleteWebhook = async (req, res, next) => {
  try { const doc = await Webhook.findOneAndDelete({ ...tenantFilter(req), _id: req.params.id }); if (!doc) return res.status(404).json({ success: false, message: "Webhook not found." }); res.json({ success: true, message: "Webhook deleted." }); } catch (e) { next(e); }
};
