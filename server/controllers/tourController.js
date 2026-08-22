import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Tour from "../models/Tour.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";
import Staff from "../models/Staff.js";
import { getSystemSettings } from "../services/settingsService.js";

const publicTourFilter = {
  available: true,
  isDeleted: false,
  published: true,
  status: { $in: ["scheduled", "upcoming", "ongoing"] },
};

const attachAvailability = (tourLike) => {
  const totalSlots = Number(tourLike?.availabilitySettings?.totalSlots ?? tourLike?.capacity ?? 0);
  const bookedSlots = Math.max(0, Number(tourLike?.availabilitySettings?.bookedSlots ?? 0));
  const availableSlots = Math.max(totalSlots - bookedSlots, 0);
  return { ...tourLike, totalSlots, bookedSlots, availableSlots, isFull: availableSlots === 0 };
};

export const getTours = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const { page = 1, limit = 12, search, destination, category, featured } = req.query;
    const filter = mergeTenantFilter({ ...publicTourFilter });

    if (destination) filter.destination = destination;
    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const currentPage = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (currentPage - 1) * pageSize;

    const [tours, total] = await Promise.all([
      Tour.find(filter)
        .populate("destination")
        .sort({ featured: -1, popularity: -1, createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Tour.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: tours.map(attachAvailability),
      tours: tours.map(attachAvailability),
      pagination: {
        page: currentPage,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
      tenantId,
    });
  } catch (error) {
    return next(error);
  }
};
