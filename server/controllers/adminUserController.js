import mongoose from "mongoose";
import User from "../models/User.js";

const STATUS_VALUES = [
  "active",
  "inactive",
  "disabled",
  "suspended",
  "blocked",
];

export const getUsers = async (req, res, next) => {
  try {
    const { search = "" } = req.query;
    const query = {};

    if (String(search).trim()) {
      const regex = {
        $regex: String(search).trim(),
        $options: "i",
      };

      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { role: regex },
        { status: regex },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const data = users.map((user) => ({
      ...user,
      isActive: user.status === "active",
    }));

    return res.json({
      success: true,
      count: data.length,
      data,
      users: data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!STATUS_VALUES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user status",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    )
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const result = {
      ...user,
      isActive: user.status === "active",
    };

    return res.status(200).json({
      success: true,
      message: `User status changed to ${status}`,
      user: result,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
