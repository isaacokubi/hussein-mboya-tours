import User from "../models/User.js";
import Role from "../models/Role.js";

export const tourManagerOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("role");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (!user.role || user.role.name !== "tourmanager") {
      return res.status(403).json({
        message: "Tour Manager access required",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: "Authorization failed",

      error: error.message,
    });
  }
};
