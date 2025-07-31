const alertRulesService = require("../services/alertRules.service");
const {
  formatErrorForResponse,
  logErrorWithContext,
  isOperationalError,
} = require("../utils/errors");

// Get all alert rules with pagination
const getAllAlertRules = async (req, res) => {
  try {
    const result = await alertRulesService.getAllAlertRules(req.query);

    res.json({
      success: true,
      data: result.rules,
      pagination: result.pagination,
    });
  } catch (error) {
    logErrorWithContext(error, { 
      operation: "getAllAlertRules", 
      query: req.query,
      userAgent: req.get('User-Agent'),
      ip: req.ip 
    });

    const errorResponse = formatErrorForResponse(error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};

// Get alert rule by ID
const getAlertRuleById = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await alertRulesService.getAlertRuleById(id);

    res.json({
      success: true,
      data: rule,
    });
  } catch (error) {
    logErrorWithContext(error, { 
      operation: "getAlertRuleById", 
      id: req.params.id,
      userAgent: req.get('User-Agent'),
      ip: req.ip 
    });

    const errorResponse = formatErrorForResponse(error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};

// Create alert rule
const createAlertRule = async (req, res) => {
  try {
    const { rule_type, threshold, active = true } = req.body;
    const rule = await alertRulesService.createAlertRule({
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
    if (
      error.message.includes("is required") ||
      error.message.includes("Invalid rule type") ||
      error.message.includes("must be greater than 0") ||
      error.message.includes("already exists")
    ) {
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
    const rule = await alertRulesService.updateAlertRule(id, {
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
    if (
      error.message.includes("Invalid rule type") ||
      error.message.includes("must be greater than 0") ||
      error.message.includes("already exists")
    ) {
      return res.status(400).json({
        success: false,
        error: error.message,
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
    const result = await alertRulesService.deleteAlertRule(id);

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

// Update alert rule threshold
const updateAlertRuleThreshold = async (req, res) => {
  try {
    const { id } = req.params;
    const { threshold } = req.body;

    // Validar threshold
    if (!threshold || threshold <= 0) {
      return res.status(400).json({
        success: false,
        error: "Threshold must be greater than 0",
      });
    }

    const rule = await alertRulesService.updateAlertRule(id, { threshold });

    res.json({
      message: "Alert rule threshold updated successfully",
      success: true,
      data: rule,
    });
  } catch (error) {
    console.error("Error updating alert rule threshold:", error);

    if (error.message === "Alert rule not found") {
      return res.status(404).json({
        success: false,
        error: "Alert rule not found",
      });
    }

    if (error.message.includes("already exists")) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update alert rule threshold",
    });
  }
};

// Toggle alert rule status
const toggleAlertRuleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await alertRulesService.toggleAlertRuleStatus(id);

    res.json({
      success: true,
      data: rule,
      message: `Alert rule ${
        rule.active ? "activated" : "deactivated"
      } successfully`,
    });
  } catch (error) {
    console.error("Error toggling alert rule status:", error);
    if (error.message === "Alert rule not found") {
      return res.status(404).json({
        success: false,
        error: "Alert rule not found",
      });
    }
    if (error.message.includes("already exists")) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to toggle alert rule status",
    });
  }
};

// Get active alert rules
const getActiveAlertRules = async (req, res) => {
  try {
    const rules = await alertRulesService.getActiveAlertRules();

    res.json({
      success: true,
      data: rules,
      count: rules.length,
    });
  } catch (error) {
    console.error("Error fetching active alert rules:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch active alert rules",
    });
  }
};

// Execute alert rules
const executeAlertRules = async (req, res) => {
  try {
    const result = await alertRulesService.executeAlertRules();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error executing alert rules:", error);
    res.status(500).json({
      success: false,
      error: "Failed to execute alert rules",
    });
  }
};

// Get alert rule statistics
const getAlertRuleStats = async (req, res) => {
  try {
    const stats = await alertRulesService.getAlertRuleStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching alert rule statistics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch alert rule statistics",
    });
  }
};

module.exports = {
  getAllAlertRules,
  getAlertRuleById,
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
  toggleAlertRuleStatus,
  getActiveAlertRules,
  executeAlertRules,
  updateAlertRuleThreshold,
  getAlertRuleStats,
};
