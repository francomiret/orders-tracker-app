const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  NotificationNotFoundError,
  NotificationValidationError,
  DatabaseError,
  DatabaseQueryError,
  RepositoryError,
  logErrorWithContext,
} = require("../utils/errors");

const createNotification = async (notificationData) => {
  try {
    // Validate required fields
    if (!notificationData.user_id) {
      throw new NotificationValidationError("User ID is required", "user_id");
    }

    if (!notificationData.type) {
      throw new NotificationValidationError(
        "Notification type is required",
        "type"
      );
    }

    if (!notificationData.title) {
      throw new NotificationValidationError(
        "Notification title is required",
        "title"
      );
    }

    if (!notificationData.message) {
      throw new NotificationValidationError(
        "Notification message is required",
        "message"
      );
    }

    const notification = await prisma.notification.create({
      data: notificationData,
    });

    return notification;
  } catch (error) {
    if (error instanceof NotificationValidationError) {
      throw error;
    }

    logErrorWithContext(error, {
      operation: "createNotification",
      notificationData,
    });
    throw new DatabaseQueryError(
      "Failed to create notification",
      "createNotification"
    );
  }
};

const findNotificationsByUserId = async (userId, options = {}) => {
  try {
    if (!userId) {
      throw new NotificationValidationError("User ID is required", "userId");
    }

    const { skip = 0, take = 50, unreadOnly = false } = options;

    const where = { user_id: userId };
    if (unreadOnly) {
      where.read = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take,
    });

    return notifications;
  } catch (error) {
    if (error instanceof NotificationValidationError) {
      throw error;
    }

    logErrorWithContext(error, {
      operation: "findNotificationsByUserId",
      userId,
      options,
    });
    throw new DatabaseQueryError(
      "Failed to fetch notifications by user ID",
      "findNotificationsByUserId"
    );
  }
};

const findNotificationById = async (id) => {
  try {
    if (!id || isNaN(parseInt(id))) {
      throw new NotificationValidationError("Invalid notification ID", "id");
    }

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) },
    });

    if (!notification) {
      throw new NotificationNotFoundError(id);
    }

    return notification;
  } catch (error) {
    if (
      error instanceof NotificationNotFoundError ||
      error instanceof NotificationValidationError
    ) {
      throw error;
    }

    logErrorWithContext(error, { operation: "findNotificationById", id });
    throw new DatabaseQueryError(
      "Failed to fetch notification by ID",
      "findNotificationById"
    );
  }
};

const markAsRead = async (id) => {
  try {
    if (!id || isNaN(parseInt(id))) {
      throw new NotificationValidationError("Invalid notification ID", "id");
    }

    const notification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: {
        read: true,
        read_at: new Date(),
      },
    });

    return notification;
  } catch (error) {
    if (error instanceof NotificationValidationError) {
      throw error;
    }

    if (error.code === "P2025") {
      throw new NotificationNotFoundError(id);
    }

    logErrorWithContext(error, { operation: "markAsRead", id });
    throw new DatabaseQueryError(
      "Failed to mark notification as read",
      "markAsRead"
    );
  }
};

const markAllAsRead = async (userId) => {
  try {
    if (!userId) {
      throw new NotificationValidationError("User ID is required", "userId");
    }

    const result = await prisma.notification.updateMany({
      where: {
        user_id: userId,
        read: false,
      },
      data: {
        read: true,
        read_at: new Date(),
      },
    });

    return result;
  } catch (error) {
    if (error instanceof NotificationValidationError) {
      throw error;
    }

    logErrorWithContext(error, { operation: "markAllAsRead", userId });
    throw new DatabaseQueryError(
      "Failed to mark all notifications as read",
      "markAllAsRead"
    );
  }
};

const deleteNotification = async (id) => {
  try {
    if (!id || isNaN(parseInt(id))) {
      throw new NotificationValidationError("Invalid notification ID", "id");
    }

    const notification = await prisma.notification.delete({
      where: { id: parseInt(id) },
    });

    return notification;
  } catch (error) {
    if (error instanceof NotificationValidationError) {
      throw error;
    }

    if (error.code === "P2025") {
      throw new NotificationNotFoundError(id);
    }

    logErrorWithContext(error, { operation: "deleteNotification", id });
    throw new DatabaseQueryError(
      "Failed to delete notification",
      "deleteNotification"
    );
  }
};

const getNotificationStats = async (userId) => {
  try {
    if (!userId) {
      throw new NotificationValidationError("User ID is required", "userId");
    }

    const [total, unread, read] = await Promise.all([
      prisma.notification.count({ where: { user_id: userId } }),
      prisma.notification.count({ where: { user_id: userId, read: false } }),
      prisma.notification.count({ where: { user_id: userId, read: true } }),
    ]);

    return { total, unread, read };
  } catch (error) {
    if (error instanceof NotificationValidationError) {
      throw error;
    }

    logErrorWithContext(error, { operation: "getNotificationStats", userId });
    throw new DatabaseQueryError(
      "Failed to get notification stats",
      "getNotificationStats"
    );
  }
};

module.exports = {
  createNotification,
  findNotificationsByUserId,
  findNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
};
