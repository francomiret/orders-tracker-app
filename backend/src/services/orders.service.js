const ordersRepository = require("../repository/orders.repository");
const { parsePagination } = require("../utils/pagination");

// Definición de la secuencia de estados válidos
const ORDER_STATUS_SEQUENCE = {
  CREATED: 1,
  PREPARING: 2,
  DISPATCHED: 3,
  DELIVERED: 4,
};

// Validar si un cambio de estado es válido según la secuencia
const isValidStatusTransition = (currentStatus, newStatus) => {
  const currentLevel = ORDER_STATUS_SEQUENCE[currentStatus];
  const newLevel = ORDER_STATUS_SEQUENCE[newStatus];

  // EXCEPCIÓN: Permitir retroceso de DISPATCHED a PREPARING para devoluciones
  if (currentStatus === "DISPATCHED" && newStatus === "PREPARING") {
    return true;
  }

  // Solo permitir avanzar al siguiente estado o mantener el actual
  return newLevel === currentLevel || newLevel === currentLevel + 1;
};

// Generar ID único para eventos para evitar duplicados
const generateEventId = (orderId, eventType, timestamp) => {
  return `${orderId}_${eventType}_${timestamp.getTime()}`;
};

const getAllOrders = async (query) => {
  const { skip, take } = parsePagination(query);
  const filter = {
    customer_name: query.customer_name || undefined,
  };

  const [orders, totalCount] = await Promise.all([
    ordersRepository.findAll({ skip, take, filter }),
    ordersRepository.count(filter),
  ]);

  return {
    orders,
    pagination: {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      total: totalCount,
      totalPages: Math.ceil(totalCount / (parseInt(query.limit) || 10)),
    },
  };
};

const getOrderById = async (id) => {
  const order = await ordersRepository.findById(id);
  if (!order) {
    throw new Error("Order not found");
  }
  return order;
};

const createOrder = async (orderData) => {
  if (!orderData.customer_name) {
    throw new Error("Customer name is required");
  }

  // Crear la orden con el evento inicial
  const order = await ordersRepository.create(orderData);

  // Registrar el evento de creación
  await ordersRepository.createOrderEvent({
    order_id: order.id,
    event_type: "CREATED",
    timestamp: new Date(),
    event_id: generateEventId(order.id, "CREATED", new Date()),
  });

  return order;
};

const updateOrderStatus = async (id, status, eventId = null) => {
  const validStatuses = ["CREATED", "PREPARING", "DISPATCHED", "DELIVERED"];
  if (!validStatuses.includes(status)) {
    throw new Error(
      "Invalid status. Must be one of: CREATED, PREPARING, DISPATCHED, DELIVERED"
    );
  }

  const order = await ordersRepository.findById(id);
  if (!order) {
    throw new Error("Order not found");
  }

  // REGLA 1: Validar progresión secuencial
  if (!isValidStatusTransition(order.status, status)) {
    throw new Error(
      `Invalid status transition from ${order.status} to ${status}. ` +
        `Order must progress sequentially through states.`
    );
  }

  // REGLA 2: Verificar idempotencia - si el estado es el mismo, no hacer nada
  if (order.status === status) {
    return {
      ...order,
      message: "Status unchanged - idempotent operation",
    };
  }

  // REGLA 3: Verificar si el evento ya fue procesado
  if (eventId) {
    const existingEvent = await ordersRepository.findEventById(eventId);
    if (existingEvent) {
      return {
        ...order,
        message: "Event already processed - idempotent operation",
      };
    }
  }

  // Generar ID único para el evento si no se proporciona
  const timestamp = new Date();
  const finalEventId = eventId || generateEventId(id, status, timestamp);

  // Actualizar la orden y crear el evento en una transacción
  const updatedOrder = await ordersRepository.updateWithEvent({
    orderId: id,
    newStatus: status,
    eventData: {
      order_id: id,
      event_type: status,
      timestamp: timestamp,
      event_id: finalEventId,
    },
  });

  return {
    ...updatedOrder,
    message: `Order status updated from ${order.status} to ${status}`,
    eventId: finalEventId,
  };
};

// Método para procesar eventos de cambio de estado de forma idempotente
const processStatusChangeEvent = async (orderId, status, eventId) => {
  try {
    return await updateOrderStatus(orderId, status, eventId);
  } catch (error) {
    if (
      error.message.includes("already processed") ||
      error.message.includes("Status unchanged")
    ) {
      // Evento ya procesado - comportamiento idempotente
      const order = await ordersRepository.findById(orderId);
      return {
        ...order,
        message: "Event already processed - idempotent operation",
      };
    }
    throw error;
  }
};

const deleteOrder = async (id) => {
  const order = await ordersRepository.findById(id);
  if (!order) {
    throw new Error("Order not found");
  }

  await ordersRepository.deleteById(id);
  return { message: "Order deleted successfully" };
};

const getOrderEvents = async (orderId) => {
  const order = await ordersRepository.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  return await ordersRepository.findEventsByOrderId(orderId);
};

const getOrderAlerts = async (orderId) => {
  const order = await ordersRepository.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  return await ordersRepository.findAlertsByOrderId(orderId);
};

// Método para obtener el historial completo de cambios de estado
const getOrderStatusHistory = async (orderId) => {
  const order = await ordersRepository.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  const events = await ordersRepository.findEventsByOrderId(orderId);

  return {
    orderId,
    currentStatus: order.status,
    statusHistory: events.map((event) => ({
      status: event.event_type,
      timestamp: event.timestamp,
      eventId: event.event_id,
    })),
  };
};

// Método para validar la integridad de la secuencia de estados
const validateOrderStatusIntegrity = async (orderId) => {
  const order = await ordersRepository.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  const events = await ordersRepository.findEventsByOrderId(orderId);
  const sortedEvents = events.sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  let isValid = true;
  let lastStatusLevel = 0;
  const violations = [];

  for (const event of sortedEvents) {
    const currentLevel = ORDER_STATUS_SEQUENCE[event.event_type];

    if (currentLevel <= lastStatusLevel && lastStatusLevel !== 0) {
      isValid = false;
      violations.push({
        event: event.event_type,
        timestamp: event.timestamp,
        issue: `Invalid regression from level ${lastStatusLevel} to ${currentLevel}`,
      });
    }

    lastStatusLevel = currentLevel;
  }

  return {
    orderId,
    isValid,
    violations,
  };
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  processStatusChangeEvent,
  deleteOrder,
  getOrderEvents,
  getOrderAlerts,
  getOrderStatusHistory,
  validateOrderStatusIntegrity,
  ORDER_STATUS_SEQUENCE,
  isValidStatusTransition,
  generateEventId,
};
