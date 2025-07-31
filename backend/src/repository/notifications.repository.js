const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createNotification = async (notificationData) => {
  return await prisma.notification.create({
    data: notificationData,
  });
};

const findNotificationsByUserId = async (userId, options = {}) => {
  const { skip = 0, take = 50, unreadOnly = false } = options;

  const where = { user_id: userId };
  if (unreadOnly) {
    where.read = false;
  }

  return await prisma.notification.findMany({
    where,
    orderBy: { created_at: "desc" },
    skip,
    take,
  });
};

const findNotificationById = async (id) => {
  return await prisma.notification.findUnique({
    where: { id: parseInt(id) },
  });
};

const markAsRead = async (id) => {
  return await prisma.notification.update({
    where: { id: parseInt(id) },
    data: {
      read: true,
      read_at: new Date(),
    },
  });
};

const markAllAsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: {
      user_id: userId,
      read: false,
    },
    data: {
      read: true,
      read_at: new Date(),
    },
  });
};

const deleteNotification = async (id) => {
  return await prisma.notification.delete({
    where: { id: parseInt(id) },
  });
};

const getNotificationStats = async (userId) => {
  const [total, unread, read] = await Promise.all([
    prisma.notification.count({ where: { user_id: userId } }),
    prisma.notification.count({ where: { user_id: userId, read: false } }),
    prisma.notification.count({ where: { user_id: userId, read: true } }),
  ]);

  return { total, unread, read };
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
