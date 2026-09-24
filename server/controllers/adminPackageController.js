import mongoose from "mongoose";
import TourPackage from "../models/TourPackage.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
const fields = [
  "title", "description", "shortDescription", "destination", "country", "startLocation", "category",
  "duration", "numberOfDays", "currency", "basePrice", "agentPrice", "discountPercentage",
  "discountPrice", "minimumGuests", "maximumGuests", "availableSeats", "itinerary", "inclusions",
  "exclusions", "highlights", "bookingDeadline", "instantBooking", "featured", "seo", "coverImage", "gallery",
];
const allowedStatuses = new Set(["draft", "active", "inactive", "sold_out"]);

const packagePayload = (body = {}, existing = null) => {
  const payload = Object.fromEntries(Object.entries(body).filter(([key]) => fields.includes(key)));
  const current = existing?.toObject?.() || existing || {};
  if (body.published !== undefined && typeof body.published !== "boolean") throw Object.assign(new Error("published must be a boolean."), { status: 400 });
  for (const key of ["title", "description", "destination", "duration"]) {
    if (payload[key] !== undefined) payload[key] = String(payload[key]).trim();
  }
  for (const key of ["title", "description", "destination", "duration", "category"]) {
    if (!String(payload[key] ?? current[key] ?? "").trim()) {
      throw Object.assign(new Error("Title, description, destination, category and duration are required."), { status: 400 });
    }
  }
  if (!existing || body.slug !== undefined) {
    payload.slug = slugify(body.slug || payload.title || current.title);
    if (!payload.slug) throw Object.assign(new Error("A valid package slug is required."), { status: 400 });
  }
  if (!existing) {
    payload.country = String(payload.country || "Kenya").trim();
    payload.currency = String(payload.currency || "KES").trim().toUpperCase();
    payload.status = body.status === undefined ? "draft" : body.status;
    if (!allowedStatuses.has(payload.status)) throw Object.assign(new Error("Invalid package status."), { status: 400 });
    if (body.published !== undefined && typeof body.published !== "boolean") throw Object.assign(new Error("published must be a boolean."), { status: 400 });
    payload.published = body.published === true;
  }
  for (const key of ["basePrice", "agentPrice"]) {
    const value = payload[key] ?? current[key];
    if (value !== undefined) {
      payload[key] = Number(value);
      if (!Number.isFinite(payload[key]) || payload[key] < 0) throw Object.assign(new Error("Base and agent prices must be valid non-negative amounts."), { status: 400 });
    }
  }
  if (payload.duration !== undefined || !existing) {
    const value = payload.duration ?? current.duration;
    const match = String(value || "").match(/^\s*(\d+(?:\.\d+)?)\s*(?:days?|nights?)?\s*$/i);
    const durationDays = Number(match?.[1]);
    if (!Number.isFinite(durationDays) || durationDays < 1 || durationDays > 365) throw Object.assign(new Error("Duration must be from 1 to 365 days."), { status: 400 });
  }
  if (payload.currency !== undefined) payload.currency = String(payload.currency).trim().toUpperCase();
  return payload;
};

export async function listAdminPackages(req, res, next) {
  try {
    requireTenantId();
    const packages = await TourPackage.find(mergeTenantFilter(req, { isDeleted: { $ne: true } })).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, count: packages.length, packages });
  } catch (error) { return next(error); }
}

export async function listPublicPackages(req, res, next) {
  try {
    requireTenantId();
    const records = await TourPackage.find(mergeTenantFilter(req, {
      status: "active", published: true, isDeleted: { $ne: true },
    })).select("title slug description shortDescription destination country category duration numberOfDays currency basePrice discountPercentage discountPrice featured coverImage gallery").sort({ featured: -1, createdAt: -1 }).lean();
    const image = (item) => item ? { url: item.url, caption: item.caption } : undefined;
    const packages = records.map((item) => ({
      ...item,
      coverImage: image(item.coverImage),
      gallery: (item.gallery || []).map(image),
    }));
    return res.json({ success: true, count: packages.length, packages });
  } catch (error) { return next(error); }
}

export async function createAdminPackage(req, res, next) {
  try {
    const tenantId = requireTenantId();
    const payload = packagePayload(req.body);
    const created = await TourPackage.create({ ...payload, tenantId, createdBy: req.user._id });
    return res.status(201).json({ success: true, package: created });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "A package with this slug already exists in this tenant." });
    return next(error);
  }
}

export async function updateAdminPackage(req, res, next) {
  try {
    requireTenantId();
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid package ID." });
    const existing = await TourPackage.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } }));
    if (!existing) return res.status(404).json({ success: false, message: "Package not found." });
    const payload = packagePayload(req.body, existing);
    if (req.body?.slug !== undefined) payload.slug = slugify(req.body.slug);
    if (req.body?.status !== undefined) {
      if (!allowedStatuses.has(String(req.body.status))) return res.status(400).json({ success: false, message: "Invalid package status." });
      payload.status = req.body.status;
    }
    if (req.body?.published !== undefined) payload.published = req.body.published === true;
    const updated = await TourPackage.findOneAndUpdate(
      mergeTenantFilter(req, { _id: existing._id, isDeleted: { $ne: true } }),
      { $set: payload }, { new: true, runValidators: true },
    ).lean();
    return res.json({ success: true, package: updated });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "A package with this slug already exists in this tenant." });
    return next(error);
  }
}

export async function deleteAdminPackage(req, res, next) {
  try {
    requireTenantId();
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid package ID." });
    const deleted = await TourPackage.findOneAndUpdate(
      mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } }),
      { $set: { isDeleted: true, status: "inactive", published: false } }, { new: true },
    ).lean();
    if (!deleted) return res.status(404).json({ success: false, message: "Package not found." });
    return res.json({ success: true, deleted: true, packageId: String(deleted._id) });
  } catch (error) { return next(error); }
}
