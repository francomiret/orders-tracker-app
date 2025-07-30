const prisma = require("../config/prisma");

// Get all alerts
const getAllAlerts = async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      include: {
        order: {
          select: {
            id: true,
            customer_name: true,
            status: true,
          },
        },
      },
      orderBy: {
        triggered_at: "desc",
      },
    });

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch alerts",
    });
  }
};

// Get unresolved alerts
const getUnresolvedAlerts = async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: {
        resolved: false,
      },
      include: {
        order: {
          select: {
            id: true,
            customer_name: true,
            status: true,
          },
        },
      },
      orderBy: {
        triggered_at: "desc",
      },
    });

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error("Error fetching unresolved alerts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch unresolved alerts",
    });
  }
};

// Resolve alert
const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.update({
      where: { id: parseInt(id) },
      data: { resolved: true },
      include: {
        order: {
          select: {
            id: true,
            customer_name: true,
            status: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error("Error resolving alert:", error);
    res.status(500).json({
      success: false,
      error: "Failed to resolve alert",
    });
  }
};

// Create alert
const createAlert = async (req, res) => {
  try {
    const { order_id, alert_type, message } = req.body;

    const alert = await prisma.alert.create({
      data: {
        order_id,
        alert_type,
        message,
        triggered_at: new Date(),
        resolved: false,
      },
      include: {
        order: {
          select: {
            id: true,
            customer_name: true,
            status: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error("Error creating alert:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create alert",
    });
  }
};

// Get all alert rules
const getAllAlertRules = async (req, res) => {
  try {
    const rules = await prisma.alertRule.findMany({
      orderBy: {
        id: "asc",
      },
    });

    res.json({
      success: true,
      data: rules,
      count: rules.length,
    });
  } catch (error) {
    console.error("Error fetching alert rules:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch alert rules",
    });
  }
};

// Create alert rule
const createAlertRule = async (req, res) => {
  try {
    const { rule_type, threshold, active = true } = req.body;

    const rule = await prisma.alertRule.create({
      data: {
        rule_type,
        threshold,
        active,
      },
    });

    res.status(201).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    console.error("Error creating alert rule:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create alert rule",
    });
  }
};

// Update alert rule
const updateAlertRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { rule_type, threshold, active } = req.body;

    const rule = await prisma.alertRule.update({
      where: { id: parseInt(id) },
      data: {
        rule_type,
        threshold,
        active,
      },
    });

    res.json({
      success: true,
      data: rule,
    });
  } catch (error) {
    console.error("Error updating alert rule:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update alert rule",
    });
  }
};

// Delete alert rule
const deleteAlertRule = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.alertRule.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Alert rule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting alert rule:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete alert rule",
    });
  }
};

module.exports = {
  getAllAlerts,
  getUnresolvedAlerts,
  resolveAlert,
  createAlert,
  getAllAlertRules,
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
};
