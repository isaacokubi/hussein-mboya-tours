/**
 * Purpose: admin Hotel Creation Controller HTTP controller. Main declarations: clean, tenantIdOf, slugify, normalizeEmail, normalizeNumber.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Hotel.js so this module can use its exported dependencies.
import Hotel from "../models/Hotel.js";

// Declare clean for use by the surrounding module or function.
const clean = (value) => String(value ?? "").trim();
// Declare tenantIdOf for use by the surrounding module or function.
const tenantIdOf = (req) => req.tenantId || req.user?.tenantId || null;

// Declare slugify for use by the surrounding module or function.
const slugify = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 170);

// Declare normalizeEmail for use by the surrounding module or function.
const normalizeEmail = (value) => clean(value).toLowerCase();

// Declare normalizeNumber for use by the surrounding module or function.
const normalizeNumber = (value, fallback = null) => {
  // Check the condition (value === "" || value === null || value === undefined) and run the matching branch.
  if (value === "" || value === null || value === undefined) return fallback;
  // Declare number for use by the surrounding module or function.
  const number = Number(value);
  // Return the expression shown below to the caller.
  return Number.isFinite(number) ? number : NaN;
};

// Declare createAdminHotel for use by the surrounding module or function.
export const createAdminHotel = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = tenantIdOf(req);
    // Check the condition (!tenantId || !mongoose.isValidObjectId(tenantId)) and run the matching branch.
    if (!tenantId || !mongoose.isValidObjectId(tenantId)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "A valid company/tenant context is required before creating a hotel.",
      });
    }

    // Declare body for use by the surrounding module or function.
    const body = req.body || {};
    // Declare name for use by the surrounding module or function.
    const name = clean(body.name);
    // Declare city for use by the surrounding module or function.
    const city = clean(body.city);
    // Declare location for use by the surrounding module or function.
    const location = clean(body.location);

    // Check the condition (!name) and run the matching branch.
    if (!name) return res.status(400).json({ success: false, message: "Hotel name is required." });
    // Check the condition (!city) and run the matching branch.
    if (!city) return res.status(400).json({ success: false, message: "City is required." });
    // Check the condition (!location) and run the matching branch.
    if (!location) return res.status(400).json({ success: false, message: "Location is required." });

    // Declare starRating for use by the surrounding module or function.
    const starRating = normalizeNumber(body.starRating, 3);
    // Check the condition (!Number.isInteger(starRating) || starRating < 1 || starRating > 5) and run the matching branch.
    if (!Number.isInteger(starRating) || starRating < 1 || starRating > 5) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Star rating must be a whole number from 1 to 5." });
    }

    // Declare latitude for use by the surrounding module or function.
    const latitude = normalizeNumber(body.latitude);
    // Declare longitude for use by the surrounding module or function.
    const longitude = normalizeNumber(body.longitude);
    // Check the condition (Number.isNaN(latitude) || latitude < -90 || latitude > 90) and run the matching branch.
    if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Latitude must be between -90 and 90." });
    }
    // Check the condition (Number.isNaN(longitude) || longitude < -180 || longitude > 180) and run the matching branch.
    if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Longitude must be between -180 and 180." });
    }

    // Declare contactEmail for use by the surrounding module or function.
    const contactEmail = normalizeEmail(body.contactEmail);
    // Check the condition (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) and run the matching branch.
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Enter a valid reservations email address." });
    }

    // Declare requestedSlug for use by the surrounding module or function.
    const requestedSlug = slugify(body.slug || name) || `hotel-${Date.now()}`;
    // Declare slug for use by the surrounding module or function.
    let slug = requestedSlug;
    // Declare suffix for use by the surrounding module or function.
    let suffix = 2;
    // Repeat the enclosed work for each required iteration.
    while (await Hotel.exists({ tenantId, slug })) slug = `${requestedSlug}-${suffix++}`;

    // Declare hotel for use by the surrounding module or function.
    const hotel = await Hotel.create({
      tenantId,
      name,
      slug,
      description: clean(body.description),
      location,
      address: clean(body.address),
      city,
      county: clean(body.county),
      country: clean(body.country) || "Kenya",
      latitude,
      longitude,
      starRating,
      amenities: Array.isArray(body.amenities)
        ? body.amenities.map(clean).filter(Boolean).slice(0, 50)
        : [],
      images: Array.isArray(body.images)
        ? body.images.map(clean).filter(Boolean).slice(0, 30)
        : [],
      contactPhone: clean(body.contactPhone),
      contactEmail,
      checkInTime: clean(body.checkInTime) || "14:00",
      checkOutTime: clean(body.checkOutTime) || "11:00",
      cancellationPolicy: clean(body.cancellationPolicy),
      status: ["draft", "active", "inactive"].includes(body.status) ? body.status : "draft",
      featured: Boolean(body.featured),
      currency: clean(body.currency).toUpperCase() || "KES",
      createdBy: req.user?._id || null,
      updatedBy: req.user?._id || null,
    });

    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({
      success: true,
      message: `${hotel.name} was created successfully.`,
      data: hotel,
    });
  } catch (error) {
    // Check the condition (error?.code === 11000) and run the matching branch.
    if (error?.code === 11000) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({
        success: false,
        message: "A hotel with that identifier already exists for this company. Please use a different name.",
      });
    }
    // Return the result of next() to the caller.
    return next(error);
  }
};
