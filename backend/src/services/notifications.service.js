const notificationsRepository = require("../repository/notifications.repository");
const { sendAlertToUser, sendAlertToAdmins } = require("../websocket");

// Crear notificación y enviar por WebSocket
const createNotification = async (notificationData) => {
  try {
    // Guardar en base de datos
    const notification = await notificationsRepository.createNotification(
      notificationData
    );

    // Enviar por WebSocket
    if (notificationData.user_id) {
      sendAlertToUser(notificationData.user_id, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        created_at: notification.created_at,
      });
    } else {
      // Notificación administrativa
      sendAlertToAdmins({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        created_at: notification.created_at,
      });
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Crear notificación de alerta
const createAlertNotification = async (alert, userId = null) => {
  const notificationData = {
    user_id: userId,
    type: "ALERT_GENERATED",
    title: `Alerta: ${alert.alert_type}`,
    message: alert.message,
    data: {
      alert_id: alert.id,
      order_id: alert.order_id,
      alert_type: alert.alert_type,
    },
  };

  return await createNotification(notificationData);
};

// Crear notificación de cambio de estado
const createStatusChangeNotification = async (
  order,
  oldStatus,
  newStatus,
  userId = null
) => {
  const notificationData = {
    user_id: userId,
    type: "ORDER_STATUS_CHANGED",
    title: `Estado de Pedido Actualizado`,
    message: `El pedido ${order.id} cambió de ${oldStatus} a ${newStatus}`,
    data: {
      order_id: order.id,
      old_status: oldStatus,
      new_status: newStatus,
      customer_name: order.customer_name,
    },
  };

  return await createNotification(notificationData);
};

// Crear notificación administrativa
const createAdminNotification = async (title, message, data = {}) => {
  const notificationData = {
    user_id: null, // null para notificaciones administrativas
    type: "ADMIN_ALERT",
    title,
    message,
    data,
  };

  return await createNotification(notificationData);
};

// Obtener notificaciones de un usuario
const getUserNotifications = async (userId, options = {}) => {
  const notifications = await notificationsRepository.findNotificationsByUserId(
    userId,
    options
  );
  return notifications;
};

// Marcar como leída
const markAsRead = async (notificationId) => {
  return await notificationsRepository.markAsRead(notificationId);
};

// Marcar todas como leídas
const markAllAsRead = async (userId) => {
  return await notificationsRepository.markAllAsRead(userId);
};

// Obtener estadísticas
const getNotificationStats = async (userId) => {
  return await notificationsRepository.getNotificationStats(userId);
};

// Eliminar notificación
const deleteNotification = async (notificationId) => {
  return await notificationsRepository.deleteNotification(notificationId);
};

module.exports = {
  createNotification,
  createAlertNotification,
  createStatusChangeNotification,
  createAdminNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getNotificationStats,
  deleteNotification,
};
