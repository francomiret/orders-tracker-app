const ordersService = require("../services/orders.service");

// Get all orders with pagination
const getAllOrders = async (req, res, next) => {
  try {
    const result = await ordersService.getAllOrders(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get order by ID
const getOrderById = async (req, res, next) => {
  try {
    const order = await ordersService.getOrderById(req.params.id);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// Create new order
const createOrder = async (req, res, next) => {
  try {
    const order = await ordersService.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// Update order status with business rules validation
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, eventId } = req.body;
    const result = await ordersService.updateOrderStatus(
      req.params.id,
      status,
      eventId
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Process status change event with idempotency
const processStatusChangeEvent = async (req, res, next) => {
  try {
    const { status, eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({
        error: "eventId is required for idempotent event processing",
      });
    }

    const result = await ordersService.processStatusChangeEvent(
      req.params.id,
      status,
      eventId
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Delete order
const deleteOrder = async (req, res, next) => {
  try {
    const result = await ordersService.deleteOrder(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get order events for audit trail
const getOrderEvents = async (req, res, next) => {
  try {
    const events = await ordersService.getOrderEvents(req.params.id);
    res.json(events);
  } catch (error) {
    next(error);
  }
};

// Get order alerts
const getOrderAlerts = async (req, res, next) => {
  try {
    const alerts = await ordersService.getOrderAlerts(req.params.id);
    res.json(alerts);
  } catch (error) {
    next(error);
  }
};

// Get complete order status history
const getOrderStatusHistory = async (req, res, next) => {
  try {
    const history = await ordersService.getOrderStatusHistory(req.params.id);
    res.json(history);
  } catch (error) {
    next(error);
  }
};

// Validate order status integrity
const validateOrderStatusIntegrity = async (req, res, next) => {
  try {
    const validation = await ordersService.validateOrderStatusIntegrity(
      req.params.id
    );
    res.json(validation);
  } catch (error) {
    next(error);
  }
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
};
