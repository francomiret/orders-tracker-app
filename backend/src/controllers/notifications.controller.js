const notificationsService = require("../services/notifications.service");

const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.query.userId;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const notifications = await notificationsService.getUserNotifications(
      userId,
      {
        skip,
        take: parseInt(limit),
        unreadOnly: unreadOnly === "true",
      }
    );

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await notificationsService.markAsRead(id);

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// Marcar todas las notificaciones como leídas
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const result = await notificationsService.markAllAsRead(userId);

    res.json({
      success: true,
      data: {
        message: "All notifications marked as read",
        count: result.count,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getNotificationStats = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const stats = await notificationsService.getNotificationStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await notificationsService.deleteNotification(id);

    res.json({
      success: true,
      data: {
        message: "Notification deleted successfully",
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getNotificationStats,
  deleteNotification,
};
