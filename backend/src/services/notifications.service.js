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

// Función mejorada para crear notificaciones de alerta
const createAlertNotification = async (alert, userId = null) => {
  // Determinar el título y mensaje basado en el tipo de alerta
  let title, message, priority;

  switch (alert.alert_type) {
    case "NOT_DISPATCHED_IN_X_DAYS":
      title = "🚨 Pedido Retrasado";
      message = `El pedido ${alert.order_id} lleva demasiado tiempo sin ser despachado`;
      priority = "high";
      break;
    case "NOT_DELIVERED_SAME_DAY":
      title = "⚠️ Pedido No Entregado";
      message = `El pedido ${alert.order_id} creado hoy no ha sido entregado`;
      priority = "critical";
      break;
    default:
      title = `Alerta: ${alert.alert_type}`;
      message = alert.message;
      priority = "medium";
  }

  const notificationData = {
    user_id: userId,
    type: "ALERT_GENERATED",
    title,
    message,
    data: {
      alert_id: alert.id,
      order_id: alert.order_id,
      alert_type: alert.alert_type,
      priority,
      original_message: alert.message,
    },
  };

  return await createNotification(notificationData);
};

// Función para crear notificaciones de cambio de estado
const createStatusChangeNotification = async (
  order,
  oldStatus,
  newStatus,
  userId = null
) => {
  const statusEmojis = {
    CREATED: "🚚",
    PREPARING: "⚙️",
    DISPATCHED: "🚚",
    DELIVERED: "✅",
  };

  const notificationData = {
    user_id: userId,
    type: "ORDER_STATUS_CHANGED",
    title: `${statusEmojis[newStatus]} Estado Actualizado`,
    message: `El pedido ${order.id} cambió de ${oldStatus} a ${newStatus}`,
    data: {
      order_id: order.id,
      old_status: oldStatus,
      new_status: newStatus,
      customer_name: order.customer_name,
      status_emoji: statusEmojis[newStatus],
    },
  };

  return await createNotification(notificationData);
};

// Función para crear notificaciones administrativas mejoradas
const createAdminNotification = async (title, message, data = {}) => {
  const notificationData = {
    user_id: null, // null para notificaciones administrativas
    type: "ADMIN_ALERT",
    title: `👨‍💼 ${title}`,
    message,
    data: {
      ...data,
      admin_notification: true,
      timestamp: new Date().toISOString(),
    },
  };

  return await createNotification(notificationData);
};

// Obtener notificaciones de un usuario
const getUserNotifications = async (userId, options = {}) => {
  const {
    skip = 0,
    take = 50,
    unreadOnly = false,
    type = null,
    priority = null,
  } = options;

  const notifications = await notificationsRepository.findNotificationsByUserId(
    userId,
    { skip, take, unreadOnly }
  );

  // Filtrar por tipo si se especifica
  if (type) {
    notifications = notifications.filter((n) => n.type === type);
  }

  // Filtrar por prioridad si se especifica
  if (priority) {
    notifications = notifications.filter((n) => n.data?.priority === priority);
  }

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

// Función para obtener estadísticas detalladas
const getDetailedNotificationStats = async (userId) => {
  const notifications = await notificationsRepository.findNotificationsByUserId(
    userId,
    { skip: 0, take: 1000 }
  );

  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    read: notifications.filter((n) => n.read).length,
    byType: {
      ALERT_GENERATED: notifications.filter((n) => n.type === "ALERT_GENERATED")
        .length,
      ORDER_STATUS_CHANGED: notifications.filter(
        (n) => n.type === "ORDER_STATUS_CHANGED"
      ).length,
      ADMIN_ALERT: notifications.filter((n) => n.type === "ADMIN_ALERT").length,
      SYSTEM_NOTIFICATION: notifications.filter(
        (n) => n.type === "SYSTEM_NOTIFICATION"
      ).length,
    },
    byPriority: {
      critical: notifications.filter((n) => n.data?.priority === "critical")
        .length,
      high: notifications.filter((n) => n.data?.priority === "high").length,
      medium: notifications.filter((n) => n.data?.priority === "medium").length,
      low: notifications.filter((n) => n.data?.priority === "low").length,
    },
    recent: notifications.filter(
      (n) => new Date(n.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length,
  };

  return stats;
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
  getDetailedNotificationStats,
  deleteNotification,
};
