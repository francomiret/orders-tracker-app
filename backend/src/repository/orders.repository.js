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
    where: { id: parseInt(id) },
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
      events: {
        create: [{ event_type: "CREATED", timestamp: new Date() }],
      },
    },
    include: { events: true },
  });
};

const update = (id, data) => {
  return prisma.order.update({
    where: { id: parseInt(id) },
    data: {
      ...data,
      events: {
        create: [{ event_type: data.status, timestamp: new Date() }],
      },
    },
    include: {
      events: { orderBy: { timestamp: "desc" } },
    },
  });
};

const deleteById = (id) => {
  return prisma.order.delete({
    where: { id: parseInt(id) },
  });
};

const findEventsByOrderId = (orderId) => {
  return prisma.orderEvent.findMany({
    where: { order_id: parseInt(orderId) },
    orderBy: { timestamp: "desc" },
  });
};

const findAlertsByOrderId = (orderId) => {
  return prisma.alert.findMany({
    where: { order_id: parseInt(orderId) },
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

module.exports = {
  findAll,
  findById,
  create,
  update,
  deleteById,
  findEventsByOrderId,
  findAlertsByOrderId,
  count,
};
