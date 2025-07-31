const prisma = require("../config/prisma");

const findAll = ({ skip, take, filter }) => {
  return prisma.order.findMany({
    skip,
    take,
    where: {
      customer_name: filter?.customer_name || undefined,
    },
    include: {
      events: { orderBy: { timestamp: "desc" } },
    },
    orderBy: { created_at: "desc" },
  });
};

const findById = (id) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      events: { orderBy: { timestamp: "desc" } },
    },
  });
};

const create = (data) => {
  return prisma.order.create({
    data: {
      ...data,
      status: "CREATED",
    },
    include: { events: true },
  });
};

// Método para crear eventos de orden
const createOrderEvent = (eventData) => {
  return prisma.orderEvent.create({
    data: eventData,
  });
};

// Método para buscar un evento por su ID único
const findEventById = (eventId) => {
  return prisma.orderEvent.findUnique({
    where: { event_id: eventId },
  });
};

// Método para actualizar orden y crear evento en una transacción
const updateWithEvent = async ({ orderId, newStatus, eventData }) => {
  return await prisma.$transaction(async (tx) => {
    // Actualizar la orden
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: {
        events: { orderBy: { timestamp: "desc" } },
      },
    });

    // Crear el evento de cambio de estado
    await tx.orderEvent.create({
      data: eventData,
    });

    return updatedOrder;
  });
};

const update = (id, data) => {
  return prisma.order.update({
    where: { id: id },
    data: {
      ...data,
    },
    include: {
      events: { orderBy: { timestamp: "desc" } },
    },
  });
};

const deleteById = (id) => {
  return prisma.order.delete({
    where: { id: id },
  });
};

const findEventsByOrderId = (orderId) => {
  return prisma.orderEvent.findMany({
    where: { order_id: orderId },
    orderBy: { timestamp: "desc" },
  });
};

const count = (filter) => {
  return prisma.order.count({
    where: {
      customer_name: filter?.customer_name || undefined,
    },
  });
};

const getOrderEventStats = async (orderId) => {
  const events = await prisma.orderEvent.findMany({
    where: { order_id: orderId },
    orderBy: { timestamp: "asc" },
  });

  const stats = {
    totalEvents: events.length,
    eventTypes: {},
    timeline: events.map((event) => ({
      event_type: event.event_type,
      timestamp: event.timestamp,
      user_id: event.user_id,
    })),
  };

  events.forEach((event) => {
    stats.eventTypes[event.event_type] =
      (stats.eventTypes[event.event_type] || 0) + 1;
  });

  return stats;
};

const eventExists = async (orderId, eventType, eventId) => {
  const existingEvent = await prisma.orderEvent.findFirst({
    where: {
      order_id: orderId,
      event_type: eventType,
      event_id: eventId,
    },
  });

  return !!existingEvent;
};

module.exports = {
  findAll,
  findById,
  create,
  createOrderEvent,
  findEventById,
  updateWithEvent,
  update,
  deleteById,
  findEventsByOrderId,
  count,
  getOrderEventStats,
  eventExists,
};
