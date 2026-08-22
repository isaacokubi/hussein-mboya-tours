import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// server/controllers/tourAvailabilityController.js

import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";

/*
|--------------------------------------------------------------------------
| GET TOUR AVAILABILITY
|--------------------------------------------------------------------------
| Returns:
| - Capacity
| - Booked slots
| - Available slots
| - Occupancy percentage
|--------------------------------------------------------------------------
*/

export const getTourAvailability = async (req, res, next) => {
  requireTenantId();
  try {
    const tour = await Tour.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    const bookingStats = await Booking.aggregate([
      {
        $match: {
          tour: tour._id,
          isDeleted: { $ne: true },
          status: {
            $nin: ["cancelled", "refunded", "completed"],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalGuests: {
            $sum: {
              $ifNull: ["$numberOfGuests", 1],
            },
          },
          totalBookings: {
            $sum: 1,
          },
        },
      },
    ]);

    const bookedSlots = bookingStats[0]?.totalGuests || 0;
    const totalBookings = bookingStats[0]?.totalBookings || 0;

    const configuredSlots = Number(
      tour.availabilitySettings?.totalSlots ??
      tour.capacity ??
      tour.maxGuests ??
      tour.availableSeats ??
      0
    );

    const totalSlots =
      configuredSlots > 0
        ? configuredSlots
        : Math.max(
            Number(tour.capacity || 0),
            Number(tour.maxGuests || 0),
            20
          );

    const availableSlots = Math.max(totalSlots - bookedSlots, 0);

    const occupancyRate =
      totalSlots > 0
        ? Number(((bookedSlots / totalSlots) * 100).toFixed(1))
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        tourId: tour._id,
        tourName: tour.title,
        totalSlots,
        bookedSlots,
        availableSlots,
        totalBookings,
        occupancyRate,
        isFull: availableSlots === 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE TOUR AVAILABILITY
|--------------------------------------------------------------------------
*/

export const updateTourAvailability = async (req, res, next) => {
  try {
    const { totalSlots } = req.body;

    if (
      totalSlots === undefined ||
      Number(totalSlots) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Total slots must be greater than zero.",
      });
    }

    const tour = await Tour.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    const bookingStats = await Booking.aggregate([
      {
        $match: {
          tour: tour._id,
          isDeleted: { $ne: true },
          status: {
            $nin: ["cancelled", "refunded", "completed"],
          },
        },
      },
      {
        $group: {
          _id: null,
          bookedGuests: {
            $sum: {
              $ifNull: ["$numberOfGuests", 1],
            },
          },
        },
      },
    ]);

    const bookedGuests = bookingStats[0]?.bookedGuests || 0;

    if (Number(totalSlots) < bookedGuests) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce capacity below the current booked guests (${bookedGuests}).`,
      });
    }

    tour.capacity = Number(totalSlots);
    tour.availabilitySettings = tour.availabilitySettings || {};
    tour.availabilitySettings.totalSlots = Number(totalSlots);
    tour.availabilitySettings.bookedSlots = bookedGuests;

    await tour.save();

    const updatedTour = await Tour.findById(tour._id)
      .populate("destination")
      .populate("assignedGuide")
      .populate("assignedDriver")
      .populate("assignedVehicle");

    return res.status(200).json({
      success: true,
      message: "Tour capacity updated successfully.",
      data: {
        tour: updatedTour,
        bookedSlots: bookedGuests,
        availableSlots: Number(totalSlots) - bookedGuests,
      },
    });
  } catch (error) {
    next(error);
  }
};