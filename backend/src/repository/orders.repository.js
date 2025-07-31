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
      alerts: { where: { resolved: false } },
    },
    orderBy: { created_at: "desc" },
  });
};

const findById = (id) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      events: { orderBy: { timestamp: "desc" } },
      alerts: { orderBy: { triggered_at: "desc" } },
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

const findAlertsByOrderId = (orderId) => {
  return prisma.alert.findMany({
    where: { order_id: orderId },
    orderBy: { triggered_at: "desc" },
  });
};

const count = (filter) => {
  return prisma.order.count({
    where: {
      customer_name: filter?.customer_name || undefined,
    },
  });
};

// Método para obtener estadísticas de eventos por orden
const getOrderEventStats = async (orderId) => {
  const events = await prisma.orderEvent.findMany({
    where: { order_id: orderId },
    orderBy: { timestamp: "asc" },
  });

  const eventCounts = events.reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {});

  return {
    totalEvents: events.length,
    eventCounts,
    firstEvent: events[0],
    lastEvent: events[events.length - 1],
    events: events,
  };
};

// Método para verificar si un evento específico ya existe
const eventExists = async (orderId, eventType, eventId) => {
  const existingEvent = await prisma.orderEvent.findFirst({
    where: {
      OR: [
        { event_id: eventId },
        {
          order_id: orderId,
          event_type: eventType,
        },
      ],
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
  findAlertsByOrderId,
  count,
  getOrderEventStats,
  eventExists,
};
