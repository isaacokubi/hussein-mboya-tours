/**
 * Purpose: itinerary Controller HTTP controller. Main declarations: activeFilter, createItinerary, getItineraries, getItinerary, updateItinerary.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../models/Itinerary.js so this module can use its exported dependencies.
import Itinerary from "../models/Itinerary.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";

// Declare activeFilter for use by the surrounding module or function.
const activeFilter = (req, extra = {}) => mergeTenantFilter(req, { isDeleted: { $ne: true }, ...extra });

// Declare createItinerary for use by the surrounding module or function.
export const createItinerary = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { tour } for use by the surrounding module or function.
    const { tour } = req.body || {};
    // Check the condition (!tour || !mongoose.Types.ObjectId.isValid(tour)) and run the matching branch.
    if (!tour || !mongoose.Types.ObjectId.isValid(tour)) return res.status(400).json({ success: false, message: "A valid tour is required." });
    // Declare existingTour for use by the surrounding module or function.
    const existingTour = await Tour.findOne(mergeTenantFilter(req, { _id: tour, isDeleted: { $ne: true } })).lean();
    // Check the condition (!existingTour) and run the matching branch.
    if (!existingTour) return res.status(404).json({ success: false, message: "Tour not found" });

    // Declare existingItinerary for use by the surrounding module or function.
    const existingItinerary = await Itinerary.findOne(activeFilter(req, { tour })).lean();
    // Check the condition (existingItinerary) and run the matching branch.
    if (existingItinerary) return res.status(409).json({ success: false, message: "This tour already has an active itinerary. Edit the existing itinerary instead." });

    // Declare itinerary for use by the surrounding module or function.
    const itinerary = await Itinerary.create({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id,
      isDeleted: false,
    });
    // Declare populated for use by the surrounding module or function.
    const populated = await Itinerary.findOne(activeFilter(req, { _id: itinerary._id }))
      .populate("tour", "title destination")
      .populate("createdBy", "name email");
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, message: "Itinerary created successfully", itinerary: populated, data: populated });
  } catch (error) {
    // Check the condition (error?.code === 11000) and run the matching branch.
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "This tour already has an itinerary. Edit the existing itinerary instead." });
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare getItineraries for use by the surrounding module or function.
export const getItineraries = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare filter for use by the surrounding module or function.
    const filter = tenantFilter(req);
    // Perform the side effect or state update expressed on the following line.
    filter.isDeleted = { $ne: true };
    // Check the condition (req.query.tour) and run the matching branch.
    if (req.query.tour) filter.tour = req.query.tour;
    // Check the condition (req.query.status && ["draft", "published", "archived"].includes(req.qu) and run the matching branch.
    if (req.query.status && ["draft", "published", "archived"].includes(req.query.status)) filter.status = req.query.status;
    // Declare itineraries for use by the surrounding module or function.
    const itineraries = await Itinerary.find(filter)
      .populate("tour", "title destination")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, count: itineraries.length, itineraries, data: itineraries });
  } catch (error) { next(error); }
};

// Declare getItinerary for use by the surrounding module or function.
export const getItinerary = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid itinerary id." });
    // Declare itinerary for use by the surrounding module or function.
    const itinerary = await Itinerary.findOne(activeFilter(req, { _id: req.params.id }))
      .populate("tour", "title destination")
      .populate("createdBy", "name email");
    // Check the condition (!itinerary) and run the matching branch.
    if (!itinerary) return res.status(404).json({ success: false, message: "Itinerary not found" });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, itinerary, data: itinerary });
  } catch (error) { next(error); }
};

// Declare updateItinerary for use by the surrounding module or function.
export const updateItinerary = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid itinerary id." });
    // Check the condition (req.body?.tour) and run the matching branch.
    if (req.body?.tour) {
      // Check the condition (!mongoose.Types.ObjectId.isValid(req.body.tour)) and run the matching branch.
      if (!mongoose.Types.ObjectId.isValid(req.body.tour)) return res.status(400).json({ success: false, message: "A valid tour is required." });
      // Declare tour for use by the surrounding module or function.
      const tour = await Tour.findOne(mergeTenantFilter(req, { _id: req.body.tour, isDeleted: { $ne: true } })).lean();
      // Check the condition (!tour) and run the matching branch.
      if (!tour) return res.status(400).json({ success: false, message: "Selected tour does not belong to this tenant." });
      // Declare duplicate for use by the surrounding module or function.
      const duplicate = await Itinerary.findOne(activeFilter(req, { tour, _id: { $ne: req.params.id } })).lean();
      // Check the condition (duplicate) and run the matching branch.
      if (duplicate) return res.status(409).json({ success: false, message: "The selected tour already has another active itinerary." });
    }
    // Declare update for use by the surrounding module or function.
    const update = { ...req.body, updatedBy: req.user?._id };
    // Perform the side effect or state update expressed on the following line.
    delete update.createdBy;
    // Perform the side effect or state update expressed on the following line.
    delete update.isDeleted;
    // Declare itinerary for use by the surrounding module or function.
    const itinerary = await Itinerary.findOneAndUpdate(activeFilter(req, { _id: req.params.id }), update, { new: true, runValidators: true })
      .populate("tour", "title destination")
      .populate("createdBy", "name email");
    // Check the condition (!itinerary) and run the matching branch.
    if (!itinerary) return res.status(404).json({ success: false, message: "Itinerary not found" });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "Itinerary updated successfully", itinerary, data: itinerary });
  } catch (error) {
    // Check the condition (error?.code === 11000) and run the matching branch.
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "This tour already has an active itinerary." });
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare deleteItinerary for use by the surrounding module or function.
export const deleteItinerary = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid itinerary id." });
    // Declare itinerary for use by the surrounding module or function.
    const itinerary = await Itinerary.findOneAndUpdate(
      activeFilter(req, { _id: req.params.id }),
      { $set: { isDeleted: true, updatedBy: req.user?._id || null } },
      { new: true }
    );
    // Check the condition (!itinerary) and run the matching branch.
    if (!itinerary) return res.status(404).json({ success: false, message: "Itinerary not found" });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "Itinerary deleted successfully" });
  } catch (error) { next(error); }
};
