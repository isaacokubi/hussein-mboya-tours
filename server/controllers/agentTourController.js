/**
 * Purpose: agent Tour Controller HTTP controller. Main declarations: isValidId, cleanString, buildImages, scope, getAgentProfile.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load slugify so this module can use its exported dependencies.
import slugify from "slugify";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";

// Declare isValidId for use by the surrounding module or function.
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
// Declare cleanString for use by the surrounding module or function.
const cleanString = (value = "") => String(value).trim().replace(/\s+/g, " ");
// Declare buildImages for use by the surrounding module or function.
const buildImages = (files = []) => files.map((file) => ({ url: file.path, publicId: file.filename || "" }));
// Declare allowedFields for use by the surrounding module or function.
const allowedFields = ["title", "description", "shortDescription", "destination", "country", "location", "category", "duration", "difficulty", "capacity", "maxGuests", "price", "agentPrice", "discount", "startDate", "endDate", "tourStatus", "status", "featured", "available", "included", "excluded", "itinerary", "highlights"];
// Declare scope for use by the surrounding module or function.
const scope = (req, filter = {}) => mergeTenantFilter(req, filter);

// Declare getAgentProfile for use by the surrounding module or function.
const getAgentProfile = async (req) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Return the result of Agent.findOne() to the caller.
  return Agent.findOne(scope(req, { user: req.user._id }));
};

// Declare createAgentTour for use by the surrounding module or function.
export const createAgentTour = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!req.user || !isValidId(req.user._id)) and run the matching branch.
    if (!req.user || !isValidId(req.user._id)) return res.status(401).json({ success: false, message: "Unauthorized." });
    // Declare agentProfile for use by the surrounding module or function.
    const agentProfile = await getAgentProfile(req);
    // Check the condition (!agentProfile) and run the matching branch.
    if (!agentProfile) return res.status(404).json({ success: false, message: "Agent profile not found." });
    // Check the condition (!agentProfile.isApproved || agentProfile.status !== "active") and run the matching branch.
    if (!agentProfile.isApproved || agentProfile.status !== "active") return res.status(403).json({ success: false, message: "Agent account is not approved or active." });
    // Check the condition (!req.body.title) and run the matching branch.
    if (!req.body.title) return res.status(400).json({ success: false, message: "Tour title is required." });
    // Check the condition (!req.body.destination) and run the matching branch.
    if (!req.body.destination) return res.status(400).json({ success: false, message: "Destination is required." });
    // Check the condition (req.body.price === undefined && req.body.agentPrice === undefined) and run the matching branch.
    if (req.body.price === undefined && req.body.agentPrice === undefined) return res.status(400).json({ success: false, message: "Tour price is required." });

    // Declare title for use by the surrounding module or function.
    const title = cleanString(req.body.title);
    // Declare slug for use by the surrounding module or function.
    const slug = slugify(title, { lower: true, strict: true });
    // Declare exists for use by the surrounding module or function.
    const exists = await Tour.exists(scope(req, { slug, isDeleted: false }));
    // Check the condition (exists) and run the matching branch.
    if (exists) return res.status(409).json({ success: false, message: "A tour with this title already exists." });

    // Declare tourData for use by the surrounding module or function.
    const tourData = {};
    // Repeat the enclosed work for each required iteration.
    for (const field of allowedFields) if (req.body[field] !== undefined) tourData[field] = req.body[field];
    // Perform the side effect or state update expressed on the following line.
    tourData.title = title;
    // Perform the side effect or state update expressed on the following line.
    tourData.slug = slug;
    // Check the condition (tourData.price === undefined && tourData.agentPrice !== undefined) and run the matching branch.
    if (tourData.price === undefined && tourData.agentPrice !== undefined) tourData.price = Number(tourData.agentPrice);
    // Check the condition (tourData.agentPrice === undefined && tourData.price !== undefined) and run the matching branch.
    if (tourData.agentPrice === undefined && tourData.price !== undefined) tourData.agentPrice = Number(tourData.price);
    // Check the condition (req.files?.length) and run the matching branch.
    if (req.files?.length) tourData.images = buildImages(req.files);
    // Perform the side effect or state update expressed on the following line.
    tourData.tenantId = req.tenantId;
    // Perform the side effect or state update expressed on the following line.
    tourData.createdBy = req.user._id;
    // Perform the side effect or state update expressed on the following line.
    tourData.agentCreated = true;
    // Perform the side effect or state update expressed on the following line.
    tourData.isDeleted = false;
    // Check the condition (!tourData.status) and run the matching branch.
    if (!tourData.status) tourData.status = "draft";

    // Declare tour for use by the surrounding module or function.
    const tour = await Tour.create(tourData);
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, message: "Tour created successfully.", tour });
  } catch (error) { next(error); }
};

// Declare getAgentTours for use by the surrounding module or function.
export const getAgentTours = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!req.user || !isValidId(req.user._id)) and run the matching branch.
    if (!req.user || !isValidId(req.user._id)) return res.status(401).json({ success: false, message: "Unauthorized." });
    // Declare filter for use by the surrounding module or function.
    const filter = scope(req, { createdBy: req.user._id, isDeleted: false });
    // Check the condition (req.query.status) and run the matching branch.
    if (req.query.status) filter.status = req.query.status;
    // Declare tours for use by the surrounding module or function.
    const tours = await Tour.find(filter).sort({ createdAt: -1 }).lean();
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, count: tours.length, tours });
  } catch (error) { next(error); }
};

// Declare getAgentTour for use by the surrounding module or function.
export const getAgentTour = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!isValidId(req.params.id)) and run the matching branch.
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });
    // Declare tour for use by the surrounding module or function.
    const tour = await Tour.findOne(scope(req, { _id: req.params.id, createdBy: req.user._id, isDeleted: false }));
    // Check the condition (!tour) and run the matching branch.
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, tour });
  } catch (error) { next(error); }
};

// Declare updateAgentTour for use by the surrounding module or function.
export const updateAgentTour = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!isValidId(req.params.id)) and run the matching branch.
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });
    // Declare tour for use by the surrounding module or function.
    const tour = await Tour.findOne(scope(req, { _id: req.params.id, createdBy: req.user._id, isDeleted: false }));
    // Check the condition (!tour) and run the matching branch.
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });

    // Repeat the enclosed work for each required iteration.
    for (const field of allowedFields) if (req.body[field] !== undefined) tour[field] = req.body[field];
    // Check the condition (req.body.title) and run the matching branch.
    if (req.body.title) tour.title = cleanString(req.body.title);
    // Check the condition (req.body.title && tour.isModified("title")) and run the matching branch.
    if (req.body.title && tour.isModified("title")) {
      // Declare baseSlug for use by the surrounding module or function.
      const baseSlug = slugify(tour.title, { lower: true, strict: true });
      // Declare slug for use by the surrounding module or function.
      let slug = baseSlug;
      // Declare counter for use by the surrounding module or function.
      let counter = 1;
      // Repeat the enclosed work for each required iteration.
      while (await Tour.exists(scope(req, { _id: { $ne: tour._id }, slug, isDeleted: false }))) slug = `${baseSlug}-${++counter}`;
      // Perform the side effect or state update expressed on the following line.
      tour.slug = slug;
    }
    // Check the condition (req.body.price !== undefined) and run the matching branch.
    if (req.body.price !== undefined) tour.price = Number(req.body.price);
    // Check the condition (req.body.agentPrice !== undefined) and run the matching branch.
    if (req.body.agentPrice !== undefined) tour.agentPrice = Number(req.body.agentPrice);
    // Check the condition (req.files?.length) and run the matching branch.
    if (req.files?.length) tour.images = buildImages(req.files);
    // Perform the side effect or state update expressed on the following line.
    tour.updatedBy = req.user._id;
    // Perform the side effect or state update expressed on the following line.
    await tour.save();
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "Tour updated successfully.", tour });
  } catch (error) { next(error); }
};

// Declare deleteAgentTour for use by the surrounding module or function.
export const deleteAgentTour = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!isValidId(req.params.id)) and run the matching branch.
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });
    // Declare tour for use by the surrounding module or function.
    const tour = await Tour.findOne(scope(req, { _id: req.params.id, createdBy: req.user._id, isDeleted: false }));
    // Check the condition (!tour) and run the matching branch.
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });
    // Perform the side effect or state update expressed on the following line.
    tour.isDeleted = true;
    // Perform the side effect or state update expressed on the following line.
    tour.deletedAt = new Date();
    // Perform the side effect or state update expressed on the following line.
    tour.updatedBy = req.user._id;
    // Perform the side effect or state update expressed on the following line.
    await tour.save();
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "Tour deleted successfully." });
  } catch (error) { next(error); }
};

export default { createAgentTour, getAgentTours, getAgentTour, updateAgentTour, deleteAgentTour };
