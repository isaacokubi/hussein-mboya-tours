import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Itinerary from "../models/Itinerary.js";
import Tour from "../models/Tour.js";

export const createItinerary = async (req, res, next) => {
  requireTenantId();
  try {
    const { tour } = req.body || {};
    if (!tour || !mongoose.Types.ObjectId.isValid(tour)) {
      return res.status(400).json({ success: false, message: "A valid tour is required." });
    }
    const existingTour = await Tour.findOne(mergeTenantFilter(req, { _id: tour, isDeleted: { $ne: true } })).lean();
    if (!existingTour) return res.status(404).json({ success: false, message: "Tour not found" });
    const itinerary = await Itinerary.create({ ...req.body, createdBy: req.user._id });
    const populated = await Itinerary.findOne(mergeTenantFilter(req, { _id: itinerary._id }))
      .populate("tour", "title destination")
      .populate("createdBy", "name email");
    return res.status(201).json({ success: true, message: "Itinerary created successfully", itinerary: populated, data: populated });
  } catch (error) { next(error); }
};

export const getItineraries = async (req, res, next) => {
  try {
    const filter = tenantFilter(req);
    if (req.query.tour) filter.tour = req.query.tour;
    const itineraries = await Itinerary.find(filter)
      .populate("tour", "title destination")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: itineraries.length, itineraries, data: itineraries });
  } catch (error) { next(error); }
};

export const getItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne(mergeTenantFilter(req, { _id: req.params.id }))
      .populate("tour", "title destination")
      .populate("createdBy", "name email");
    if (!itinerary) return res.status(404).json({ success: false, message: "Itinerary not found" });
    return res.status(200).json({ success: true, itinerary, data: itinerary });
  } catch (error) { next(error); }
};

export const updateItinerary = async (req, res, next) => {
  try {
    if (req.body?.tour) {
      const tour = await Tour.findOne(mergeTenantFilter(req, { _id: req.body.tour, isDeleted: { $ne: true } })).lean();
      if (!tour) return res.status(400).json({ success: false, message: "Selected tour does not belong to this tenant." });
    }
    const itinerary = await Itinerary.findOneAndUpdate(
      mergeTenantFilter(req, { _id: req.params.id }),
      req.body,
      { new: true, runValidators: true }
    ).populate("tour", "title destination").populate("createdBy", "name email");
    if (!itinerary) return res.status(404).json({ success: false, message: "Itinerary not found" });
    return res.status(200).json({ success: true, message: "Itinerary updated successfully", itinerary, data: itinerary });
  } catch (error) { next(error); }
};

export const deleteItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete(mergeTenantFilter(req, { _id: req.params.id }));
    if (!itinerary) return res.status(404).json({ success: false, message: "Itinerary not found" });
    return res.status(200).json({ success: true, message: "Itinerary deleted successfully" });
  } catch (error) { next(error); }
};
