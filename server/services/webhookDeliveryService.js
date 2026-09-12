import crypto from "crypto";
import dns from "dns/promises";
import net from "net";
import Webhook from "../models/Webhook.js";
import WebhookDelivery from "../models/WebhookDelivery.js";
import { enqueueJob } from "./jobQueueService.js";
import { postJsonToPinnedHttpsUrl } from "./ssrfSafeHttpsService.js";

const TIMEOUT_MS = Math.min(15000, Math.max(3000, Number(process.env.WEBHOOK_TIMEOUT_MS || 10000)));
const MAX_BODY_BYTES = 64 * 1024;
const secretKey = () => {
  const secret = String(process.env.WEBHOOK_SECRET_KEY || process.env.JWT_SECRET || "");
  if (!secret) throw new Error("Webhook signing encryption secret is not configured.");
  if (process.env.NODE_ENV === "production" && !process.env.WEBHOOK_SECRET_KEY) throw new Error("WEBHOOK_SECRET_KEY must be configured in production.");
  return crypto.createHash("sha256").update(secret).digest();
};

function encryptSecret(secret) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", secretKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(String(secret), "utf8"), cipher.final()]);
  return `v1:${iv.toString("base64url")}:${cipher.getAuthTag().toString("base64url")}:${ciphertext.toString("base64url")}`;
}

function decryptSecret(value) {
  if (!String(value || "").startsWith("v1:")) return String(value || "");
  const [, iv, tag, ciphertext] = String(value).split(":");
  if (!iv || !tag || !ciphertext) throw new Error("Invalid encrypted webhook secret.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", secretKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
}

function isPrivateAddress(address) {
  if (net.isIPv4(address)) {
    const [a, b] = address.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 0) || (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19));
  }
  if (net.isIPv6(address)) {
    const value = address.toLowerCase();
    return value === "::1" || value === "::" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80:") || value.startsWith("ff");
  }
  return true;
}

export async function validateWebhookUrl(rawUrl) {
  let parsed;
  try { parsed = new URL(String(rawUrl || "").trim()); } catch { throw new Error("Invalid webhook URL."); }
  if (parsed.protocol !== "https:") throw new Error("Webhook URL must use HTTPS.");
  if (parsed.username || parsed.password) throw new Error("Webhook URL must not contain credentials.");
  const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (["localhost", "localhost.localdomain", "metadata.google.internal", "metadata", "host.docker.internal"].includes(host) || (net.isIP(host) && isPrivateAddress(host))) {
    throw new Error("Webhook URL cannot target a private or local address.");
  }
  if (!net.isIP(host)) {
    const records = await dns.lookup(host, { all: true, verbatim: true });
    if (!records.length || records.some(({ address }) => isPrivateAddress(address))) throw new Error("Webhook URL resolves to a private or local address.");
  }
  return parsed.toString();
}

export async function protectWebhookSecret(secret) {
  return encryptSecret(secret);
}

export async function queueWebhookEvent({ tenantId, event, data, sourceId = "" }) {
  if (!tenantId || !event) return null;
  const hooks = await Webhook.find({ tenantId, active: true, events: event }).select("_id").lean();
  return Promise.all(hooks.map(async (hook) => {
    const stableSource = sourceId || crypto.createHash("sha256").update(JSON.stringify(data || {})).digest("hex");
    const idempotencyKey = `webhook:${hook._id}:${event}:${stableSource}`;
    const existing = await enqueueJob("webhook.delivery", { webhookId: hook._id, event, eventId: crypto.randomUUID(), data }, { tenantId, idempotencyKey, maxAttempts: 8 });
    return existing;
  }));
}

async function recordDelivery({ tenantId, webhookId, event, eventId, attempt, values }) {
  const filter = { tenantId, webhookId, eventId, attempt };
  return WebhookDelivery.findOneAndUpdate(filter, { $set: values }, { upsert: true, new: true, setDefaultsOnInsert: true });
}

export async function deliverWebhookJob(payload, job = {}) {
  const webhook = await Webhook.findById(payload.webhookId).select("+secret");
  if (!webhook || !webhook.active) return;
  if (!webhook.events.includes(payload.event)) return;

  const eventId = payload.eventId || crypto.randomUUID();
  const attempt = Math.max(1, Number(job.attempts || 1));
  const body = JSON.stringify({ id: eventId, type: payload.event, occurredAt: payload.occurredAt || new Date().toISOString(), data: payload.data || {} });
  if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) throw new Error("Webhook payload exceeds the maximum allowed size.");
  const requestHash = crypto.createHash("sha256").update(body).digest("hex");
  await recordDelivery({ tenantId: webhook.tenantId, webhookId: webhook._id, event: payload.event, eventId, attempt, values: { status: "pending", requestHash, error: "", nextRetryAt: null } });

  let validatedUrl;
  try { validatedUrl = await validateWebhookUrl(webhook.url); } catch (error) {
    await recordDelivery({ tenantId: webhook.tenantId, webhookId: webhook._id, event: payload.event, eventId, attempt, values: { status: "failed", error: String(error?.message || error).slice(0, 2000), nextRetryAt: null } });
    throw error;
  }

  const secret = decryptSecret(webhook.secret);
  if (!secret) throw new Error("Webhook secret is not configured.");
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto.createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");

  try {
    const response = await postJsonToPinnedHttpsUrl(validatedUrl, body, {
      timeoutMs: TIMEOUT_MS,
      headers: { "content-type": "application/json", "user-agent": "HusseinMboyaTours-Webhook/1.0", "x-webhook-event": payload.event, "x-webhook-id": eventId, "x-webhook-timestamp": timestamp, "x-webhook-signature": `v1=${signature}` },
    });
    const responseText = response.body || "";
    if (response.status >= 300 && response.status < 400) throw Object.assign(new Error("Webhook endpoint returned a redirect, which is not permitted."), { statusCode: response.status, responseText });
    if (response.status < 200 || response.status >= 300) throw Object.assign(new Error(`Webhook endpoint returned HTTP ${response.status}.`), { statusCode: response.status, responseText });
    await recordDelivery({ tenantId: webhook.tenantId, webhookId: webhook._id, event: payload.event, eventId, attempt, values: { status: "delivered", httpStatus: response.status, response: responseText.slice(0, 4000), error: "", deliveredAt: new Date(), nextRetryAt: null } });
    webhook.lastDeliveryAt = new Date();
    webhook.lastStatus = response.status;
    webhook.failureCount = 0;
    await webhook.save();
  } catch (error) {
    const nextRetryAt = new Date(Date.now() + Math.min(1440, 2 ** Math.min(attempt, 9)) * 60 * 1000);
    await recordDelivery({ tenantId: webhook.tenantId, webhookId: webhook.tenantId, event: payload.event, eventId, attempt, values: { status: "failed", httpStatus: Number(error?.statusCode) || null, response: String(error?.responseText || "").slice(0, 4000), error: String(error?.message || error).slice(0, 2000), nextRetryAt } });
    webhook.lastDeliveryAt = new Date();
    webhook.lastStatus = Number(error?.statusCode) || null;
    webhook.failureCount = Number(webhook.failureCount || 0) + 1;
    if (webhook.failureCount >= 8) webhook.active = false;
    await webhook.save();
    throw error;
  }
}
