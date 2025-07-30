const prisma = require("../config/prisma");

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        events: {
          orderBy: {
            timestamp: "desc",
          },
        },
        alerts: {
          where: {
            resolved: false,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.json({
      success: true,
      data: orders,
      count: orders.length,
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

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: {
            timestamp: "desc",
          },
        },
        alerts: {
          orderBy: {
            triggered_at: "desc",
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
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

    const order = await prisma.order.create({
      data: {
        customer_name,
        status: "CREATED",
        events: {
          create: [
            {
              event_type: "CREATED",
              timestamp: new Date(),
            },
          ],
        },
      },
      include: {
        events: true,
      },
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
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

    // Validate status
    const validStatuses = ["CREATED", "PREPARING", "DISPATCHED", "DELIVERED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid status. Must be one of: CREATED, PREPARING, DISPATCHED, DELIVERED",
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        events: {
          create: [
            {
              event_type: status,
              timestamp: new Date(),
            },
          ],
        },
      },
      include: {
        events: {
          orderBy: {
            timestamp: "desc",
          },
        },
      },
    });

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
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

    await prisma.order.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
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

    const events = await prisma.orderEvent.findMany({
      where: { order_id: id },
      orderBy: {
        timestamp: "desc",
      },
    });

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching order events:", error);
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

    const alerts = await prisma.alert.findMany({
      where: { order_id: id },
      orderBy: {
        triggered_at: "desc",
      },
    });

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error("Error fetching order alerts:", error);
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
