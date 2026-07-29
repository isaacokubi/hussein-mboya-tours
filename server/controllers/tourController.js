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
    const tours = await Tour.find({
      available: true,
    })

      .populate("destination")

      .populate("guide", "name email")

      .populate("vehicle")

      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,

      count: tours.length,

      tours,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET FEATURED TOURS HOMEPAGE
|--------------------------------------------------------------------------
*/

export const getFeaturedTours = async (req, res, next) => {
  try {
    const tours = await Tour.find({
      featured: true,

      available: true,
    })

      .populate("destination")

      .limit(6)

      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,

      tours,
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
    const { keyword, category, country } = req.query;

    const filter = {};

    if (keyword) {
      filter.$text = {
        $search: keyword,
      };
    }

    if (category) {
      filter.category = category;
    }

    if (country) {
      filter.country = country;
    }

    const tours = await Tour.find(filter).sort({
      createdAt: -1,
    });

    res.json({
      success: true,

      count: tours.length,

      tours,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE TOUR BY ID
|--------------------------------------------------------------------------
*/

export const getTourById = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id)

      .populate("destination")

      .populate("guide", "name email")

      .populate("vehicle");

    if (!tour) {
      return res.status(404).json({
        success: false,

        message: "Tour not found",
      });
    }

    res.json({
      success: true,

      tour,
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
    })

      .populate("destination");

    if (!tour) {
      return res.status(404).json({
        success: false,

        message: "Tour not found",
      });
    }

    res.json({
      success: true,

      tour,
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

      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,

      message: "Tour created successfully",

      tour,
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

      .populate("guide", "name email")

      .populate("vehicle")

      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,

      count: tours.length,

      tours,
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
      },
    );

    if (!tour) {
      return res.status(404).json({
        message: "Tour not found",
      });
    }

    res.json({
      success: true,

      tour,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE TOUR
|--------------------------------------------------------------------------
*/

export const deleteTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
      return res.status(404).json({
        message: "Tour not found",
      });
    }

    res.json({
      success: true,

      message: "Tour deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ASSIGN GUIDE
|--------------------------------------------------------------------------
*/

export const assignGuide = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        message: "Tour not found",
      });
    }

    tour.guide = req.body.guideId;

    await tour.save();

    res.json({
      success: true,

      message: "Guide assigned successfully",

      tour,
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

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        message: "Tour not found",
      });
    }

    tour.vehicle = vehicle._id;

    await tour.save();

    vehicle.status = "Assigned";

    await vehicle.save();

    res.json({
      success: true,

      message: "Vehicle assigned successfully",

      tour,
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
        message: "Tour not found",
      });
    }

    if (tour.vehicle) {
      const vehicle = await Vehicle.findById(tour.vehicle);

      if (vehicle) {
        vehicle.status = "Available";

        await vehicle.save();
      }
    }

    tour.vehicle = null;

    await tour.save();

    res.json({
      success: true,

      message: "Vehicle removed",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| TOUR MANAGER REPORTS
|--------------------------------------------------------------------------
*/

export const getReports = async (req, res, next) => {
  try {
    const tours = await Tour.find({
      createdBy: req.user._id,
    });

    const tourIds = tours.map((tour) => tour._id);

    const totalTours = tours.length;

    const completedTours = await Tour.countDocuments({
      createdBy: req.user._id,

      status: "completed",
    });

    const upcomingTours = await Tour.countDocuments({
      createdBy: req.user._id,

      status: "upcoming",
    });

    const totalBookings = await Booking.countDocuments({
      tour: {
        $in: tourIds,
      },
    });

    const revenue = await Booking.aggregate([
      {
        $match: {
          tour: {
            $in: tourIds,
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
    ]);

    res.json({
      success: true,

      reports: {
        totalTours,

        completedTours,

        upcomingTours,

        totalBookings,

        totalRevenue: revenue[0]?.totalRevenue || 0,

        tours,
      },
    });
  } catch (error) {
    next(error);
  }
};
