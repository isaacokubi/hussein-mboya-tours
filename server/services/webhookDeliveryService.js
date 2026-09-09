import crypto from "crypto";
import dns from "dns/promises";
import net from "net";
import Webhook from "../models/Webhook.js";
import { enqueueJob } from "./jobQueueService.js";

const TIMEOUT_MS = Math.min(15000, Math.max(3000, Number(process.env.WEBHOOK_TIMEOUT_MS || 10000)));
const MAX_BODY_BYTES = 64 * 1024;
const secretKey = () => crypto.createHash("sha256").update(String(process.env.WEBHOOK_SECRET_KEY || process.env.JWT_SECRET || "")).digest();

function encryptSecret(secret) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", secretKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(String(secret), "utf8"), cipher.final()]);
  return `v1:${iv.toString("base64url")}:${cipher.getAuthTag().toString("base64url")}:${ciphertext.toString("base64url")}`;
}

function decryptSecret(value) {
  if (!String(value || "").startsWith("v1:")) return String(value || "");
  const [, iv, tag, ciphertext] = String(value).split(":");
  const decipher = crypto.createDecipheriv("aes-256-gcm", secretKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
}

function isPrivateAddress(address) {
  if (net.isIPv4(address)) {
    const [a, b] = address.split(".").map(Number);
    return a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a === 0;
  }
  if (net.isIPv6(address)) {
    const value = address.toLowerCase();
    return value === "::1" || value === "::" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80:");
  }
  return true;
}

export async function validateWebhookUrl(rawUrl) {
  const parsed = new URL(String(rawUrl || "").trim());
  if (parsed.protocol !== "https:") throw new Error("Webhook URL must use HTTPS.");
  if (parsed.username || parsed.password) throw new Error("Webhook URL must not contain credentials.");
  const host = parsed.hostname.toLowerCase();
  if (["localhost", "localhost.localdomain", "metadata.google.internal"].includes(host) || net.isIP(host) && isPrivateAddress(host)) {
    throw new Error("Webhook URL cannot target a private or local address.");
  }
  const records = await dns.lookup(host, { all: true, verbatim: true });
  if (!records.length || records.some((record) => isPrivateAddress(record.address))) throw new Error("Webhook URL resolves to a private or local address.");
  return parsed.toString();
}

export async function protectWebhookSecret(secret) {
  return encryptSecret(secret);
}

export async function queueWebhookEvent({ tenantId, event, data, sourceId = "" }) {
  if (!tenantId || !event) return null;
  const hooks = await Webhook.find({ tenantId, active: true, events: event }).select("_id").lean();
  return Promise.all(hooks.map((hook) => enqueueJob("webhook.delivery", {
    webhookId: hook._id,
    event,
    data,
  }, {
    tenantId,
    idempotencyKey: `webhook:${hook._id}:${event}:${sourceId || crypto.createHash("sha256").update(JSON.stringify(data || {})).digest("hex")}`,
    maxAttempts: 8,
  })));
}

export async function deliverWebhookJob(payload) {
  const webhook = await Webhook.findById(payload.webhookId).select("+secret");
  if (!webhook || !webhook.active) return;
  if (!webhook.events.includes(payload.event)) return;

  const body = JSON.stringify({
    id: crypto.randomUUID(),
    type: payload.event,
    occurredAt: new Date().toISOString(),
    data: payload.data || {},
  });
  if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) throw new Error("Webhook payload exceeds the maximum allowed size.");

  const secret = decryptSecret(webhook.secret);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto.createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(await validateWebhookUrl(webhook.url), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "GlobalTours-Webhook/1.0",
        "x-webhook-event": payload.event,
        "x-webhook-timestamp": timestamp,
        "x-webhook-signature": `v1=${signature}`,
      },
      body,
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Webhook endpoint returned HTTP ${response.status}.`);
    webhook.lastDeliveryAt = new Date();
    webhook.lastStatus = response.status;
    webhook.failureCount = 0;
    await webhook.save();
  } catch (error) {
    webhook.lastDeliveryAt = new Date();
    webhook.lastStatus = Number(error?.statusCode) || null;
    webhook.failureCount = Number(webhook.failureCount || 0) + 1;
    if (webhook.failureCount >= 8) webhook.active = false;
    await webhook.save();
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
