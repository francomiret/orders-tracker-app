const alertsRepository = require("../repository/alerts.repository");
const { parsePagination } = require("../utils/pagination");

// Alert operations
const getAllAlerts = async (query) => {
  const { skip, take } = parsePagination(query);
  const filter = {
    resolved:
      query.resolved !== undefined ? query.resolved === "true" : undefined,
  };

  const [alerts, totalCount] = await Promise.all([
    alertsRepository.findAllAlerts({ skip, take, filter }),
    alertsRepository.countAlerts(filter),
  ]);

  return {
    alerts,
    pagination: {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      total: totalCount,
      totalPages: Math.ceil(totalCount / (parseInt(query.limit) || 10)),
    },
  };
};

const getUnresolvedAlerts = async (query) => {
  const { skip, take } = parsePagination(query);

  const [alerts, totalCount] = await Promise.all([
    alertsRepository.findUnresolvedAlerts({ skip, take }),
    alertsRepository.countUnresolvedAlerts(),
  ]);

  return {
    alerts,
    pagination: {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      total: totalCount,
      totalPages: Math.ceil(totalCount / (parseInt(query.limit) || 10)),
    },
  };
};

const getAlertById = async (id) => {
  const alert = await alertsRepository.findAlertById(id);
  if (!alert) {
    throw new Error("Alert not found");
  }
  return alert;
};

const createAlert = async (alertData) => {
  if (!alertData.order_id) {
    throw new Error("Order ID is required");
  }
  if (!alertData.alert_type) {
    throw new Error("Alert type is required");
  }
  if (!alertData.message) {
    throw new Error("Message is required");
  }

  return await alertsRepository.createAlert(alertData);
};

const resolveAlert = async (id) => {
  const alert = await alertsRepository.findAlertById(id);
  if (!alert) {
    throw new Error("Alert not found");
  }

  if (alert.resolved) {
    throw new Error("Alert is already resolved");
  }

  return await alertsRepository.resolveAlert(id);
};

const deleteAlert = async (id) => {
  const alert = await alertsRepository.findAlertById(id);
  if (!alert) {
    throw new Error("Alert not found");
  }

  await alertsRepository.deleteAlert(id);
  return { message: "Alert deleted successfully" };
};

// Alert rules operations
const getAllAlertRules = async (query) => {
  const { skip, take } = parsePagination(query);

  const [rules, totalCount] = await Promise.all([
    alertsRepository.findAllAlertRules({ skip, take }),
    alertsRepository.countAlertRules(),
  ]);

  return {
    rules,
    pagination: {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      total: totalCount,
      totalPages: Math.ceil(totalCount / (parseInt(query.limit) || 10)),
    },
  };
};

const getAlertRuleById = async (id) => {
  const rule = await alertsRepository.findAlertRuleById(id);
  if (!rule) {
    throw new Error("Alert rule not found");
  }
  return rule;
};

const createAlertRule = async (ruleData) => {
  if (!ruleData.rule_type) {
    throw new Error("Rule type is required");
  }
  if (ruleData.threshold === undefined || ruleData.threshold === null) {
    throw new Error("Threshold is required");
  }

  return await alertsRepository.createAlertRule(ruleData);
};

const updateAlertRule = async (id, ruleData) => {
  const rule = await alertsRepository.findAlertRuleById(id);
  if (!rule) {
    throw new Error("Alert rule not found");
  }

  return await alertsRepository.updateAlertRule(id, ruleData);
};

const deleteAlertRule = async (id) => {
  const rule = await alertsRepository.findAlertRuleById(id);
  if (!rule) {
    throw new Error("Alert rule not found");
  }

  await alertsRepository.deleteAlertRule(id);
  return { message: "Alert rule deleted successfully" };
};

module.exports = {
  // Alert operations
  getAllAlerts,
  getUnresolvedAlerts,
  getAlertById,
  createAlert,
  resolveAlert,
  deleteAlert,

  // Alert rules operations
  getAllAlertRules,
  getAlertRuleById,
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
};
