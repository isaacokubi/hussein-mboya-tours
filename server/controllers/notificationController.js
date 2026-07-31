// server/controllers/notificationController.js

import Notification from "../models/Notification.js";

// ============================================================
// BUILD USER FILTER
// ============================================================

const getUserFilter = (userId) => ({
  $or: [
    { recipient: userId },
    { user: userId },
  ],
});

// ============================================================
// GET MY NOTIFICATIONS
// ============================================================

export const getMyNotifications = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      unread,
    } = req.query;

    const filter = getUserFilter(req.user._id);

    if (unread === "true") {
      filter.read = false;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),

      Notification.countDocuments(filter),

      Notification.countDocuments({
        ...getUserFilter(req.user._id),
        read: false,
      }),
    ]);

    return res.status(200).json({
      success: true,

      count: notifications.length,

      unreadCount,

      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },

      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// ALIAS
// ============================================================

export const getNotifications = getMyNotifications;

// ============================================================
// GET SINGLE NOTIFICATION
// ============================================================

export const getNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      ...getUserFilter(req.user._id),
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// MARK AS READ
// ============================================================

export const markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        ...getUserFilter(req.user._id),
      },
      {
        read: true,
        readAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// MARK ALL AS READ
// ============================================================

export const markAllRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      {
        ...getUserFilter(req.user._id),
        read: false,
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE NOTIFICATION
// ============================================================

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      ...getUserFilter(req.user._id),
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE ALL READ NOTIFICATIONS
// ============================================================

export const clearReadNotifications = async (req, res, next) => {
  try {
    const result = await Notification.deleteMany({
      ...getUserFilter(req.user._id),
      read: true,
    });

    return res.status(200).json({
      success: true,
      message: "Read notifications cleared.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};