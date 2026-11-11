/**
 * Purpose: driver Controller HTTP controller. Main declarations: resolveDriver, driverTourFilter, guestCount, driverDashboard.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";

// Declare DRIVER_POSITIONS for use by the surrounding module or function.
const DRIVER_POSITIONS = ["driver", "tour_driver", "tourdriver"];

// Declare resolveDriver for use by the surrounding module or function.
const resolveDriver = async (user) => {
  // Declare tenantFilter for use by the surrounding module or function.
  const tenantFilter = mergeTenantFilter({});
  // Declare email for use by the surrounding module or function.
  const email = String(user.email || "").trim().toLowerCase();
  // Declare driver for use by the surrounding module or function.
  let driver = await Staff.findOne({
    ...tenantFilter,
    $or: [
      { user: user._id },
      ...(email ? [{ email }] : []),
    ],
    position: { $in: DRIVER_POSITIONS },
    isDeleted: { $ne: true },
  });

  // Check the condition (driver) and run the matching branch.
  if (driver) {
    // Declare updates for use by the surrounding module or function.
    const updates = {};
    // Check the condition (!driver.user || driver.user.toString() !== user._id.toString()) and run the matching branch.
    if (!driver.user || driver.user.toString() !== user._id.toString()) updates.user = user._id;
    // Check the condition (driver.position !== "driver") and run the matching branch.
    if (driver.position !== "driver") updates.position = "driver";
    // Check the condition (driver.role !== "driver") and run the matching branch.
    if (driver.role !== "driver") updates.role = "driver";
    // Check the condition (!driver.isActive || driver.status !== "active") and run the matching branch.
    if (!driver.isActive || driver.status !== "active") {
      // Perform the side effect or state update expressed on the following line.
      updates.isActive = true;
      // Perform the side effect or state update expressed on the following line.
      updates.status = "active";
    }
    // Check the condition (Object.keys(updates).length) and run the matching branch.
    if (Object.keys(updates).length) {
      // Perform the side effect or state update expressed on the following line.
      await Staff.updateOne(mergeTenantFilter({ _id: driver._id }), { $set: updates });
      // Perform the side effect or state update expressed on the following line.
      driver = { ...driver.toObject(), ...updates };
    }
    // Return the value of driver to the caller.
    return driver;
  }

  // Check the condition (!email) and run the matching branch.
  if (!email) return null;

  // Perform the side effect or state update expressed on the following line.
  driver = await Staff.findOne({
    ...tenantFilter,
    email,
    position: { $in: DRIVER_POSITIONS },
    isDeleted: { $ne: true },
  });

  // Check the condition (driver) and run the matching branch.
  if (driver) return driver;

  // Perform the side effect or state update expressed on the following line.
  driver = new Staff({
    tenantId: requireTenantId(),
    name: user.name || user.email,
    email,
    phone: user.phone || "",
    position: "driver",
    role: "driver",
    user: user._id,
    availability: "available",
    isActive: true,
    status: "active",
    isDeleted: false,
    createdBy: user._id,
  });

  // Perform the side effect or state update expressed on the following line.
  await driver.save();
  // Return the value of driver to the caller.
  return driver;
};

// Declare driverTourFilter for use by the surrounding module or function.
const driverTourFilter = (driver) => {
  // Declare alternatives for use by the surrounding module or function.
  const alternatives = [
    { assignedDriver: driver._id },
    { driver: driver._id },
  ];

  // Check the condition (Array.isArray(driver.assignedTours) && driver.assignedTours.length) and run the matching branch.
  if (Array.isArray(driver.assignedTours) && driver.assignedTours.length) {
    // Perform the side effect or state update expressed on the following line.
    alternatives.push({ _id: { $in: driver.assignedTours } });
  }

  // Return the result of mergeTenantFilter() to the caller.
  return mergeTenantFilter({
    $or: alternatives,
    isDeleted: { $ne: true },
  });
};

// Declare guestCount for use by the surrounding module or function.
const guestCount = (booking) => Number(
  booking?.numberOfGuests ?? booking?.guests ?? booking?.numberOfPeople ?? 1,
) || 1;

// Declare driverDashboard for use by the surrounding module or function.
export const driverDashboard = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare driver for use by the surrounding module or function.
    const driver = await resolveDriver(req.user);
    // Check the condition (!driver) and run the matching branch.
    if (!driver) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({ success: false, message: "Driver profile not found. Ask an administrator to complete the driver account." });
    }

    // Declare tours for use by the surrounding module or function.
    const tours = await Tour.find(driverTourFilter(driver))
      .populate("destination")
      .populate("assignedGuide")
      .populate("assignedVehicle")
      .sort({ startDate: 1, date: 1 })
      .limit(25)
      .lean();

    // Declare tourIds for use by the surrounding module or function.
    const tourIds = tours.map((tour) => tour._id);
    // Declare guestStats for use by the surrounding module or function.
    const guestStats = tourIds.length
      ? await Booking.aggregate([
          { $match: mergeTenantFilter({ tour: { $in: tourIds }, isDeleted: { $ne: true }, status: { $in: ["confirmed", "assigned", "ongoing", "completed"] } }) },
          { $group: { _id: "$tour", guests: { $sum: { $ifNull: ["$numberOfGuests", 1] } }, bookings: { $sum: 1 } } },
        ])
      : [];

    // Declare guestMap for use by the surrounding module or function.
    const guestMap = new Map(guestStats.map((item) => [item._id.toString(), { guests: item.guests || 0, bookings: item.bookings || 0 }]));
    // Declare formatted for use by the surrounding module or function.
    const formatted = tours.map((tour) => ({
      ...tour,
      guests: guestMap.get(tour._id.toString())?.guests || 0,
      bookings: guestMap.get(tour._id.toString())?.bookings || 0,
      startDate: tour.startDate || tour.date || tour.travelDate,
    }));
    // Declare assignedVehicle for use by the surrounding module or function.
    const assignedVehicle = formatted.find((tour) => tour.assignedVehicle)?.assignedVehicle || null;

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      driver: { _id: driver._id, name: driver.name, phone: driver.phone, availability: driver.availability, licenseNumber: driver.licenseNumber },
      vehicle: assignedVehicle,
      assignedVehicle,
      stats: {
        totalTours: formatted.length,
        upcomingTours: formatted.filter((t) => !["completed", "cancelled"].includes(String(t.status || "").toLowerCase())).length,
        ongoingTours: formatted.filter((t) => String(t.status || "").toLowerCase() === "ongoing").length,
        completedTours: formatted.filter((t) => String(t.status || "").toLowerCase() === "completed").length,
      },
      tours: formatted,
      data: { tours: formatted, vehicle: assignedVehicle },
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
