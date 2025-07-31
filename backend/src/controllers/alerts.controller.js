const alertsService = require("../services/alerts.service");

// Get all alerts
const getAllAlerts = async (req, res) => {
  try {
    const result = await alertsService.getAllAlerts(req.query);

    res.json({
      success: true,
      data: result.alerts,
      pagination: result.pagination,
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
    const result = await alertsService.getUnresolvedAlerts(req.query);

    res.json({
      success: true,
      data: result.alerts,
      pagination: result.pagination,
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
    const alert = await alertsService.resolveAlert(id);

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error("Error resolving alert:", error);
    if (error.message === "Alert not found") {
      return res.status(404).json({
        success: false,
        error: "Alert not found",
      });
    }
    if (error.message === "Alert is already resolved") {
      return res.status(400).json({
        success: false,
        error: "Alert is already resolved",
      });
    }
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
    const alert = await alertsService.createAlert({
      order_id,
      alert_type,
      message,
    });

    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error("Error creating alert:", error);
    if (error.message.includes("is required")) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to create alert",
    });
  }
};

// Get all alert rules
const getAllAlertRules = async (req, res) => {
  try {
    const result = await alertsService.getAllAlertRules(req.query);

    res.json({
      success: true,
      data: result.rules,
      pagination: result.pagination,
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
    const rule = await alertsService.createAlertRule({
      rule_type,
      threshold,
      active,
    });

    res.status(201).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    console.error("Error creating alert rule:", error);
    if (error.message.includes("is required")) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
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
    const rule = await alertsService.updateAlertRule(id, {
      rule_type,
      threshold,
      active,
    });

    res.json({
      success: true,
      data: rule,
    });
  } catch (error) {
    console.error("Error updating alert rule:", error);
    if (error.message === "Alert rule not found") {
      return res.status(404).json({
        success: false,
        error: "Alert rule not found",
      });
    }
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
    const result = await alertsService.deleteAlertRule(id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error deleting alert rule:", error);
    if (error.message === "Alert rule not found") {
      return res.status(404).json({
        success: false,
        error: "Alert rule not found",
      });
    }
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
