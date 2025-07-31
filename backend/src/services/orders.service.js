const ordersRepository = require("../repository/orders.repository");
const { parsePagination } = require("../utils/pagination");

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
  return await ordersRepository.create(orderData);
};

const updateOrderStatus = async (id, status) => {
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

  return await ordersRepository.update(id, { status });
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

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderEvents,
  getOrderAlerts,
};
