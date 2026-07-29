import Staff from "../models/Staff.js";

// ============================================================
// CREATE STAFF
// ============================================================

export const createStaff = async (req, res) => {
  try {
    const staff = await Staff.create(req.body);

    res.status(201).json({
      success: true,

      message: "Staff created successfully",

      data: staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ============================================================
// GET ALL ACTIVE STAFF
// ============================================================
//
// Examples:
//
// GET /api/staff
//
// GET /api/staff?position=guide
//
// GET /api/staff?position=driver
//
// GET /api/staff?availability=available
//
// ============================================================

export const getStaff = async (req, res) => {
  try {
    const filter = {
      isActive: true,
    };

    // FILTER BY POSITION

    if (req.query.position) {
      filter.position = req.query.position;
    }

    // FILTER BY AVAILABILITY

    if (req.query.availability) {
      filter.availability = req.query.availability;
    }

    const staff = await Staff.find(filter)

      .populate({
        path: "assignedTours",

        select: "title startDate endDate status",
      })

      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,

      count: staff.length,

      staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ============================================================
// GET SINGLE STAFF
// ============================================================

export const getSingleStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)

      .populate({
        path: "assignedTours",

        select: "title startDate endDate status",
      });

    if (!staff) {
      return res.status(404).json({
        success: false,

        message: "Staff not found",
      });
    }

    res.status(200).json({
      success: true,

      data: staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ============================================================
// UPDATE STAFF
// ============================================================

export const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,

      req.body,

      {
        new: true,

        runValidators: true,
      },
    );

    if (!staff) {
      return res.status(404).json({
        success: false,

        message: "Staff not found",
      });
    }

    res.status(200).json({
      success: true,

      message: "Staff updated successfully",

      data: staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ============================================================
// DELETE STAFF (SOFT DELETE)
// ============================================================

export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,

      {
        isActive: false,

        status: "inactive",
      },

      {
        new: true,
      },
    );

    if (!staff) {
      return res.status(404).json({
        success: false,

        message: "Staff not found",
      });
    }

    res.status(200).json({
      success: true,

      message: "Staff removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ============================================================
// RESTORE STAFF
// ============================================================

export const restoreStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,

      {
        isActive: true,

        status: "active",

        availability: "available",
      },

      {
        new: true,
      },
    );

    if (!staff) {
      return res.status(404).json({
        success: false,

        message: "Staff not found",
      });
    }

    res.status(200).json({
      success: true,

      message: "Staff restored successfully",

      data: staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ============================================================
// GET AVAILABLE DRIVERS
// ============================================================
//
// Used when assigning vehicles/tours
//
// ============================================================

export const getDrivers = async (req, res) => {
  try {
    const drivers = await Staff.find({
      position: "driver",

      isActive: true,

      availability: "available",
    })

      .populate("assignedTours")

      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,

      count: drivers.length,

      drivers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ============================================================
// GET AVAILABLE GUIDES
// ============================================================
//
// Used when assigning tours
//
// ============================================================

export const getGuides = async (req, res) => {
  try {
    const guides = await Staff.find({
      position: "guide",

      isActive: true,

      availability: "available",
    })

      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,

      count: guides.length,

      guides,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ============================================================
// UPDATE STAFF AVAILABILITY
// ============================================================
//
// Used internally after tour assignment/completion
//
// ============================================================

export const updateStaffAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    if (!availability) {
      return res.status(400).json({
        success: false,

        message: "Availability is required",
      });
    }

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,

      {
        availability,
      },

      {
        new: true,

        runValidators: true,
      },
    );

    if (!staff) {
      return res.status(404).json({
        success: false,

        message: "Staff not found",
      });
    }

    res.status(200).json({
      success: true,

      message: "Availability updated successfully",

      staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
