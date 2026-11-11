/**
 * Purpose: admin Package Controller HTTP controller. Main declarations: slugify, packagePayload, listAdminPackages, listPublicPackages, image.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/TourPackage.js so this module can use its exported dependencies.
import TourPackage from "../models/TourPackage.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

// Declare slugify for use by the surrounding module or function.
const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
// Declare fields for use by the surrounding module or function.
const fields = [
  "title", "description", "shortDescription", "destination", "country", "startLocation", "category",
  "duration", "numberOfDays", "currency", "basePrice", "agentPrice", "discountPercentage",
  "discountPrice", "minimumGuests", "maximumGuests", "availableSeats", "itinerary", "inclusions",
  "exclusions", "highlights", "bookingDeadline", "instantBooking", "featured", "seo", "coverImage", "gallery",
];
// Declare allowedStatuses for use by the surrounding module or function.
const allowedStatuses = new Set(["draft", "active", "inactive", "sold_out"]);

// Declare packagePayload for use by the surrounding module or function.
const packagePayload = (body = {}, existing = null) => {
  // Declare payload for use by the surrounding module or function.
  const payload = Object.fromEntries(Object.entries(body).filter(([key]) => fields.includes(key)));
  // Declare current for use by the surrounding module or function.
  const current = existing?.toObject?.() || existing || {};
  // Check the condition (body.published !== undefined && typeof body.published !== "boolean") and run the matching branch.
  if (body.published !== undefined && typeof body.published !== "boolean") throw Object.assign(new Error("published must be a boolean."), { status: 400 });
  // Repeat the enclosed work for each required iteration.
  for (const key of ["title", "description", "destination", "duration"]) {
    // Check the condition (payload[key] !== undefined) and run the matching branch.
    if (payload[key] !== undefined) payload[key] = String(payload[key]).trim();
  }
  // Repeat the enclosed work for each required iteration.
  for (const key of ["title", "description", "destination", "duration", "category"]) {
    // Check the condition (!String(payload[key] ?? current[key] ?? "").trim()) and run the matching branch.
    if (!String(payload[key] ?? current[key] ?? "").trim()) {
      // Stop the current operation by raising the result of Object.assign().
      throw Object.assign(new Error("Title, description, destination, category and duration are required."), { status: 400 });
    }
  }
  // Check the condition (!existing || body.slug !== undefined) and run the matching branch.
  if (!existing || body.slug !== undefined) {
    // Perform the side effect or state update expressed on the following line.
    payload.slug = slugify(body.slug || payload.title || current.title);
    // Check the condition (!payload.slug) and run the matching branch.
    if (!payload.slug) throw Object.assign(new Error("A valid package slug is required."), { status: 400 });
  }
  // Check the condition (!existing) and run the matching branch.
  if (!existing) {
    // Perform the side effect or state update expressed on the following line.
    payload.country = String(payload.country || "Kenya").trim();
    // Perform the side effect or state update expressed on the following line.
    payload.currency = String(payload.currency || "KES").trim().toUpperCase();
    // Perform the side effect or state update expressed on the following line.
    payload.status = body.status === undefined ? "draft" : body.status;
    // Check the condition (!allowedStatuses.has(payload.status)) and run the matching branch.
    if (!allowedStatuses.has(payload.status)) throw Object.assign(new Error("Invalid package status."), { status: 400 });
    // Check the condition (body.published !== undefined && typeof body.published !== "boolean") and run the matching branch.
    if (body.published !== undefined && typeof body.published !== "boolean") throw Object.assign(new Error("published must be a boolean."), { status: 400 });
    // Perform the side effect or state update expressed on the following line.
    payload.published = body.published === true;
  }
  // Repeat the enclosed work for each required iteration.
  for (const key of ["basePrice", "agentPrice"]) {
    // Declare value for use by the surrounding module or function.
    const value = payload[key] ?? current[key];
    // Check the condition (value !== undefined) and run the matching branch.
    if (value !== undefined) {
      // Perform the side effect or state update expressed on the following line.
      payload[key] = Number(value);
      // Check the condition (!Number.isFinite(payload[key]) || payload[key] < 0) and run the matching branch.
      if (!Number.isFinite(payload[key]) || payload[key] < 0) throw Object.assign(new Error("Base and agent prices must be valid non-negative amounts."), { status: 400 });
    }
  }
  // Check the condition (payload.duration !== undefined || !existing) and run the matching branch.
  if (payload.duration !== undefined || !existing) {
    // Declare value for use by the surrounding module or function.
    const value = payload.duration ?? current.duration;
    // Declare match for use by the surrounding module or function.
    const match = String(value || "").match(/^\s*(\d+(?:\.\d+)?)\s*(?:days?|nights?)?\s*$/i);
    // Declare durationDays for use by the surrounding module or function.
    const durationDays = Number(match?.[1]);
    // Check the condition (!Number.isFinite(durationDays) || durationDays < 1 || durationDays > 3) and run the matching branch.
    if (!Number.isFinite(durationDays) || durationDays < 1 || durationDays > 365) throw Object.assign(new Error("Duration must be from 1 to 365 days."), { status: 400 });
  }
  // Check the condition (payload.currency !== undefined) and run the matching branch.
  if (payload.currency !== undefined) payload.currency = String(payload.currency).trim().toUpperCase();
  // Return the value of payload to the caller.
  return payload;
};

// Define listAdminPackages; its parameters and body implement this operation.
export async function listAdminPackages(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare packages for use by the surrounding module or function.
    const packages = await TourPackage.find(mergeTenantFilter(req, { isDeleted: { $ne: true } })).sort({ createdAt: -1 }).lean();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, count: packages.length, packages });
  } catch (error) { return next(error); }
}

// Define listPublicPackages; its parameters and body implement this operation.
export async function listPublicPackages(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare records for use by the surrounding module or function.
    const records = await TourPackage.find(mergeTenantFilter(req, {
      status: "active", published: true, isDeleted: { $ne: true },
    })).select("title slug description shortDescription destination country category duration numberOfDays currency basePrice discountPercentage discountPrice featured coverImage gallery").sort({ featured: -1, createdAt: -1 }).lean();
    // Declare image for use by the surrounding module or function.
    const image = (item) => item ? { url: item.url, caption: item.caption } : undefined;
    // Declare packages for use by the surrounding module or function.
    const packages = records.map((item) => ({
      ...item,
      coverImage: image(item.coverImage),
      gallery: (item.gallery || []).map(image),
    }));
    // Return the result of res.json() to the caller.
    return res.json({ success: true, count: packages.length, packages });
  } catch (error) { return next(error); }
}

// Define createAdminPackage; its parameters and body implement this operation.
export async function createAdminPackage(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare payload for use by the surrounding module or function.
    const payload = packagePayload(req.body);
    // Declare created for use by the surrounding module or function.
    const created = await TourPackage.create({ ...payload, tenantId, createdBy: req.user._id });
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, package: created });
  } catch (error) {
    // Check the condition (error?.code === 11000) and run the matching branch.
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "A package with this slug already exists in this tenant." });
    // Return the result of next() to the caller.
    return next(error);
  }
}

// Define updateAdminPackage; its parameters and body implement this operation.
export async function updateAdminPackage(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Check the condition (!mongoose.isValidObjectId(req.params.id)) and run the matching branch.
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid package ID." });
    // Declare existing for use by the surrounding module or function.
    const existing = await TourPackage.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } }));
    // Check the condition (!existing) and run the matching branch.
    if (!existing) return res.status(404).json({ success: false, message: "Package not found." });
    // Declare payload for use by the surrounding module or function.
    const payload = packagePayload(req.body, existing);
    // Check the condition (req.body?.slug !== undefined) and run the matching branch.
    if (req.body?.slug !== undefined) payload.slug = slugify(req.body.slug);
    // Check the condition (req.body?.status !== undefined) and run the matching branch.
    if (req.body?.status !== undefined) {
      // Check the condition (!allowedStatuses.has(String(req.body.status))) and run the matching branch.
      if (!allowedStatuses.has(String(req.body.status))) return res.status(400).json({ success: false, message: "Invalid package status." });
      // Perform the side effect or state update expressed on the following line.
      payload.status = req.body.status;
    }
    // Check the condition (req.body?.published !== undefined) and run the matching branch.
    if (req.body?.published !== undefined) payload.published = req.body.published === true;
    // Declare updated for use by the surrounding module or function.
    const updated = await TourPackage.findOneAndUpdate(
      mergeTenantFilter(req, { _id: existing._id, isDeleted: { $ne: true } }),
      { $set: payload }, { new: true, runValidators: true },
    ).lean();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, package: updated });
  } catch (error) {
    // Check the condition (error?.code === 11000) and run the matching branch.
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "A package with this slug already exists in this tenant." });
    // Return the result of next() to the caller.
    return next(error);
  }
}

// Define deleteAdminPackage; its parameters and body implement this operation.
export async function deleteAdminPackage(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Check the condition (!mongoose.isValidObjectId(req.params.id)) and run the matching branch.
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid package ID." });
    // Declare deleted for use by the surrounding module or function.
    const deleted = await TourPackage.findOneAndUpdate(
      mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } }),
      { $set: { isDeleted: true, status: "inactive", published: false } }, { new: true },
    ).lean();
    // Check the condition (!deleted) and run the matching branch.
    if (!deleted) return res.status(404).json({ success: false, message: "Package not found." });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, deleted: true, packageId: String(deleted._id) });
  } catch (error) { return next(error); }
}
