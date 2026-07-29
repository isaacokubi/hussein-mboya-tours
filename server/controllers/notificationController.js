// controllers/notificationController.js

import Notification from "../models/Notification.js";

// ============================================================
// GET MY NOTIFICATIONS
// ============================================================

export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [
        {
          recipient: req.user._id,
        },

        {
          user: req.user._id,
        },
      ],
    })

      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,

      count: notifications.length,

      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET NOTIFICATIONS
// Alias for compatibility
// ============================================================

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [
        {
          recipient: req.user._id,
        },

        {
          user: req.user._id,
        },
      ],
    })

      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,

      count: notifications.length,

      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// MARK NOTIFICATION AS READ
// ============================================================

export const markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,

      $or: [
        {
          recipient: req.user._id,
        },

        {
          user: req.user._id,
        },
      ],
    });

    if (!notification) {
      return res.status(404).json({
        success: false,

        message: "Notification not found",
      });
    }

    notification.read = true;

    await notification.save();

    res.status(200).json({
      success: true,

      notification,
    });
  } catch (error) {
    next(error);
  }
};
