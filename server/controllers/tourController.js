// server/controllers/tourController.js

import Tour from "../models/Tour.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";

/*
|--------------------------------------------------------------------------
| GET ALL PUBLIC TOURS
|--------------------------------------------------------------------------
*/

export const getTours = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      destination,
      category,
      featured,
    } = req.query;

    const filter = {
      status: "active",
    };

    if (destination) {
      filter.destination = destination;
    }

    if (category) {
      filter.category = category;
    }

    if (featured === "true") {
      filter.featured = true;
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [tours, total] = await Promise.all([
      Tour.find(filter)
        .populate("destination")
        .populate("assignedVehicle")
        .populate("assignedGuide", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),

      Tour.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,

      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },

      data: tours,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| FEATURED TOURS
|--------------------------------------------------------------------------
*/

export const getFeaturedTours = async (req, res, next) => {
  try {
    const tours = await Tour.find({
      featured: true,
      status: "active",
    })
      .populate("destination")
      .populate("assignedVehicle")
      .limit(6)
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: tours,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| SEARCH TOURS
|--------------------------------------------------------------------------
*/

export const searchTours = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      country,
      destination,
    } = req.query;

    const filter = {
      status: "active",
    };

    if (keyword) {
      filter.$or = [
        {
          title: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          description: {
            $regex: keyword,
            $options: "i",
          },
        },
      ];
    }

    if (category) filter.category = category;
    if (country) filter.country = country;
    if (destination) filter.destination = destination;

    const tours = await Tour.find(filter)
      .populate("destination")
      .populate("assignedVehicle")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: tours.length,
      data: tours,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET TOUR BY ID
|--------------------------------------------------------------------------
*/

export const getTourById = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate("destination")
      .populate("assignedVehicle")
      .populate("assignedGuide")
      .populate("assignedDriver");

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    return res.json({
      success: true,
      data: tour,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET TOUR BY SLUG
|--------------------------------------------------------------------------
*/

export const getTourBySlug = async (req, res, next) => {
  try {
    const tour = await Tour.findOne({
      slug: req.params.slug,
      status: "active",
    })
      .populate("destination")
      .populate("assignedVehicle")
      .populate("assignedGuide")
      .populate("assignedDriver");

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    return res.json({
      success: true,
      data: tour,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| CREATE TOUR
|--------------------------------------------------------------------------
*/

export const createTour = async (req, res, next) => {
  try {
    const tour = await Tour.create({
      ...req.body,
      createdBy: req.user._id,
      status: req.body.status || "active",
    });

    return res.status(201).json({
      success: true,
      message: "Tour created successfully",
      data: tour,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| MANAGER TOURS
|--------------------------------------------------------------------------
*/

export const getManagerTours = async (req, res, next) => {
  try {
    const tours = await Tour.find({
      createdBy: req.user._id,
    })
      .populate("destination")
      .populate("assignedVehicle")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: tours.length,
      data: tours,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE TOUR
|--------------------------------------------------------------------------
*/

export const updateTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    return res.json({
      success: true,
      message: "Tour updated successfully",
      data: tour,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE TOUR (SOFT DELETE)
|--------------------------------------------------------------------------
*/

export const deleteTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      {
        status: "inactive",
      },
      {
        new: true,
      }
    );

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    return res.json({
      success: true,
      message: "Tour deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ASSIGN VEHICLE
|--------------------------------------------------------------------------
*/

export const assignVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.body.vehicleId);

    if (!vehicle || !vehicle.isActive) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    if (
      vehicle.availability &&
      vehicle.availability !== "available"
    ) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is currently unavailable",
      });
    }

    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    tour.assignedVehicle = vehicle._id;

    await tour.save();

    vehicle.availability = "assigned";
    vehicle.assignedTour = tour._id;

    await vehicle.save();

    return res.json({
      success: true,
      message: "Vehicle assigned successfully",
      data: tour,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| REMOVE VEHICLE
|--------------------------------------------------------------------------
*/

export const removeVehicle = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    if (tour.assignedVehicle) {
      await Vehicle.findByIdAndUpdate(tour.assignedVehicle, {
        availability: "available",
        assignedTour: null,
      });
    }

    tour.assignedVehicle = null;

    await tour.save();

    return res.json({
      success: true,
      message: "Vehicle removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| TOUR REPORTS
|--------------------------------------------------------------------------
*/

export const getReports = async (req, res, next) => {
  try {
    const tours = await Tour.find({
      createdBy: req.user._id,
    });

    const ids = tours.map((tour) => tour._id);

    const [totalBookings, revenue] = await Promise.all([
      Booking.countDocuments({
        tour: {
          $in: ids,
        },
      }),

      Booking.aggregate([
        {
          $match: {
            tour: {
              $in: ids,
            },
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),
    ]);

    return res.json({
      success: true,
      data: {
        totalTours: tours.length,
        totalBookings,
        totalRevenue: revenue[0]?.totalRevenue || 0,
        tours,
      },
    });
  } catch (error) {
    next(error);
  }
};