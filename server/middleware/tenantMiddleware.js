import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import { runWithTenant } from "../tenancy/context.js";

const RESERVED_HOSTS = new Set(["www", "api", "localhost", "127", "admin"]);
const normalizeSlug = (value) => String(value || "").trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0].split(".")[0];

export async function resolveTenant(req, res, next) {
  try {
    // First-run/public platform endpoints must work before any tenant exists.
    // /auth/bootstrap creates the first Organization, so it cannot require
    // tenant resolution beforehand.
    if (
      req.path === "/health" ||
      req.path === "/auth/bootstrap" ||
      req.path === "/tenants" ||
      req.path.startsWith("/tenants/") ||
      req.path === "/mpesa/callback" ||
      req.path.startsWith("/mpesa/refund/") ||
      req.path.startsWith("/superadmin") ||
      req.path.startsWith("/database") ||
      req.path.startsWith("/system") ||
      req.path === "/settings"
    ) return next();

    const headerId = req.headers["x-tenant-id"];
    const headerSlug = req.headers["x-tenant-slug"];
    const host = String(req.headers.host || "").split(":")[0].toLowerCase();
    const subdomain = host.includes(".") ? host.split(".")[0] : "";
    const requested = headerId || headerSlug || (!RESERVED_HOSTS.has(subdomain) ? subdomain : "");
    const fallbackId = process.env.DEFAULT_TENANT_ID || "";

    let organization = null;
    if (requested && mongoose.Types.ObjectId.isValid(String(requested))) {
      organization = await Organization.findOne({ _id: requested, status: { $ne: "cancelled" } }).lean();
    } else if (requested) {
      organization = await Organization.findOne({ $or: [{ slug: normalizeSlug(requested) }, { domain: host }], status: { $ne: "cancelled" } }).lean();
    } else if (host && !RESERVED_HOSTS.has(subdomain)) {
      organization = await Organization.findOne({ domain: host, status: { $ne: "cancelled" } }).lean();
    } else if (fallbackId && mongoose.Types.ObjectId.isValid(fallbackId)) {
      organization = await Organization.findOne({ _id: fallbackId, status: { $ne: "cancelled" } }).lean();
    }

    if (!organization) return res.status(400).json({ success: false, code: "TENANT_REQUIRED", message: "A valid tenant is required. Send X-Tenant-ID or X-Tenant-Slug, or use a configured company domain." });

    return runWithTenant({ tenantId: organization._id, tenant: organization, bypass: false }, () => {
      req.tenant = organization;
      req.tenantId = organization._id;
      next();
    });
  } catch (error) { next(error); }
}
