const ordersService = require("../services/orders.service");

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const result = await ordersService.getAllOrders(req.query);

    res.json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch orders",
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await ordersService.getOrderById(id);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    if (error.message === "Order not found") {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to fetch order",
    });
  }
};

// Create new order
const createOrder = async (req, res) => {
  try {
    const { customer_name } = req.body;
    const order = await ordersService.createOrder({ customer_name });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    if (error.message === "Customer name is required") {
      return res.status(400).json({
        success: false,
        error: "Customer name is required",
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to create order",
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await ordersService.updateOrderStatus(id, status);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    if (error.message === "Order not found") {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }
    if (error.message.includes("Invalid status")) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to update order",
    });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ordersService.deleteOrder(id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    if (error.message === "Order not found") {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to delete order",
    });
  }
};

// Get order events
const getOrderEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const events = await ordersService.getOrderEvents(id);

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching order events:", error);
    if (error.message === "Order not found") {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to fetch order events",
    });
  }
};

// Get order alerts
const getOrderAlerts = async (req, res) => {
  try {
    const { id } = req.params;
    const alerts = await ordersService.getOrderAlerts(id);

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error("Error fetching order alerts:", error);
    if (error.message === "Order not found") {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to fetch order alerts",
    });
  }
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
