// server/controllers/driverController.js

import Tour from "../models/Tour.js";
import Staff from "../models/Staff.js";

const startOfDay = (value) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const resolveDriver = async (user) => {
  let driver = await Staff.findOne({
    $or: [
      { user: user._id },
      { email: String(user.email || "").toLowerCase() },
    ],
    position: "driver",
    isDeleted: { $ne: true },
  });

  if (!driver) {
    driver = await Staff.create({
      user: user._id,
      name: user.name || "Driver",
      email: user.email || `driver-${user._id}@coherenttours.local`,
      phone: user.phone || "N/A",
      position: "driver",
      role: "driver",
      status: "active",
      isActive: true,
      isDeleted: false,
      availability: "available",
      createdBy: user._id,
    });
  } else if (!driver.user) {
    driver.user = user._id;
    await driver.save();
  }

  return driver;
};

export const driverDashboard = async (req, res, next) => {
  try {
    const driver = await resolveDriver(req.user);

    const tours = await Tour.find({
      assignedDriver: driver._id,
      isDeleted: { $ne: true },
    })
      .populate("destination")
      .populate("assignedGuide", "name phone email")
      .populate("assignedVehicle", "name registrationNumber model type capacity status")
      .sort({ startDate: 1, date: 1 })
      .limit(20)
      .lean();

    const today = startOfDay(new Date());

    const normalizedTours = tours.map((tour) => {
      const startDate = new Date(tour.startDate || tour.date);
      const endDate = tour.endDate
        ? new Date(tour.endDate)
        : new Date(startDate.getTime() + Math.max(1, Number(tour.durationDetails?.days || 1) - 1) * 86400000);

      return {
        ...tour,
        startDate,
        endDate,
        date: tour.date || startDate,
      };
    });

    return res.status(200).json({
      success: true,
      driver: {
        id: driver._id,
        name: driver.name,
        phone: driver.phone,
        availability: driver.availability,
      },
      stats: {
        totalTours: normalizedTours.length,
        upcomingTours: normalizedTours.filter(
          (tour) => startOfDay(tour.startDate) >= today && !["completed", "cancelled"].includes(tour.status)
        ).length,
        ongoingTours: normalizedTours.filter((tour) => tour.status === "ongoing").length,
        completedTours: normalizedTours.filter((tour) => tour.status === "completed").length,
      },
      tours: normalizedTours,
      data: { tours: normalizedTours },
    });
  } catch (error) {
    next(error);
  }
};

export default { driverDashboard };
