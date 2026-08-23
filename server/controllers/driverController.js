import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import Staff from "../models/Staff.js";

const resolveDriver = async (user) => {
  const tenantFilter = mergeTenantFilter({});
  let driver = await Staff.findOne({
    ...tenantFilter,
    $or: [{ user: user._id }, { email: String(user.email || "").toLowerCase() }],
    position: "driver",
    isDeleted: { $ne: true },
  });

  if (driver) {
    const updates = {};
    if (!driver.user || driver.user.toString() !== user._id.toString()) updates.user = user._id;
    if (!driver.isActive || driver.status !== "active") {
      updates.isActive = true;
      updates.status = "active";
    }
    if (Object.keys(updates).length) {
      await Staff.updateOne(mergeTenantFilter({ _id: driver._id }), { $set: updates });
      driver = { ...driver.toObject(), ...updates };
    }
    return driver;
  }

  if (!user.email) return null;

  return Staff.findOneAndUpdate(
    mergeTenantFilter({ email: String(user.email).toLowerCase(), position: "driver" }),
    {
      $set: {
        user: user._id,
        isActive: true,
        status: "active",
        isDeleted: false,
      },
      $setOnInsert: {
        name: user.name || user.email,
        email: String(user.email).toLowerCase(),
        phone: user.phone || "",
        position: "driver",
        role: "driver",
        availability: "available",
        createdBy: user._id,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

export const driverDashboard = async (req, res, next) => {
  requireTenantId();
  try {
    const driver = await resolveDriver(req.user);
    if (!driver) {
      return res.status(404).json({ success: false, message: "Driver profile not found. Ask an administrator to complete the driver account." });
    }

    const assignmentIds = Array.isArray(driver.assignedTours) ? driver.assignedTours : [];
    const tours = await Tour.find(mergeTenantFilter({
      $or: [
        { assignedDriver: driver._id },
        ...(assignmentIds.length ? [{ _id: { $in: assignmentIds } }] : []),
      ],
      isDeleted: { $ne: true },
    }))
      .populate("destination")
      .populate("assignedGuide")
      .populate("assignedVehicle")
      .sort({ startDate: 1, date: 1 })
      .limit(25)
      .lean();

    const tourIds = tours.map((tour) => tour._id);
    const guestStats = tourIds.length
      ? await Booking.aggregate([
          { $match: mergeTenantFilter({ tour: { $in: tourIds }, isDeleted: { $ne: true }, status: { $in: ["confirmed", "assigned", "ongoing"] } }) },
          { $group: { _id: "$tour", guests: { $sum: { $ifNull: ["$numberOfGuests", 1] } }, bookings: { $sum: 1 } } },
        ])
      : [];

    const guestMap = new Map(guestStats.map((item) => [item._id.toString(), { guests: item.guests || 0, bookings: item.bookings || 0 }]));
    const formatted = tours.map((tour) => ({ ...tour, guests: guestMap.get(tour._id.toString())?.guests || 0, bookings: guestMap.get(tour._id.toString())?.bookings || 0 }));
    const assignedVehicle = formatted.find((tour) => tour.assignedVehicle)?.assignedVehicle || null;

    return res.status(200).json({
      success: true,
      driver: { _id: driver._id, name: driver.name, phone: driver.phone, availability: driver.availability, licenseNumber: driver.licenseNumber },
      vehicle: assignedVehicle,
      assignedVehicle,
      stats: {
        totalTours: formatted.length,
        upcomingTours: formatted.filter((t) => !["completed", "cancelled"].includes(t.status)).length,
        ongoingTours: formatted.filter((t) => t.status === "ongoing").length,
        completedTours: formatted.filter((t) => t.status === "completed").length,
      },
      tours: formatted,
      data: { tours: formatted, vehicle: assignedVehicle },
    });
  } catch (error) {
    next(error);
  }
};
