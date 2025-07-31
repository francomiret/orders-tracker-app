const alertsRepository = require("../repository/alerts.repository");
const ordersRepository = require("../repository/orders.repository");
const { parsePagination } = require("../utils/pagination");
const notificationsService = require("./notifications.service");

// Get all alert rules with pagination
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

// Get alert rule by ID
const getAlertRuleById = async (id) => {
  const rule = await alertsRepository.findAlertRuleById(id);
  if (!rule) {
    throw new Error("Alert rule not found");
  }
  return rule;
};

// Create alert rule with validation
const createAlertRule = async (ruleData) => {
  // Validate required fields
  if (!ruleData.rule_type) {
    throw new Error("Rule type is required");
  }
  if (ruleData.threshold === undefined || ruleData.threshold === null) {
    throw new Error("Threshold is required");
  }
  if (ruleData.threshold <= 0) {
    throw new Error("Threshold must be greater than 0");
  }

  // Validate rule type
  const validRuleTypes = ["NOT_DISPATCHED_IN_X_DAYS", "NOT_DELIVERED_SAME_DAY"];
  if (!validRuleTypes.includes(ruleData.rule_type)) {
    throw new Error(
      "Invalid rule type. Must be one of: NOT_DISPATCHED_IN_X_DAYS, NOT_DELIVERED_SAME_DAY"
    );
  }

  // Check if rule already exists
  const existingRules = await alertsRepository.findAllAlertRules({
    skip: 0,
    take: 1000,
  });
  const duplicateRule = existingRules.find(
    (rule) => rule.rule_type === ruleData.rule_type && rule.active === true
  );

  if (duplicateRule) {
    throw new Error(
      `An active rule of type '${ruleData.rule_type}' already exists`
    );
  }

  return await alertsRepository.createAlertRule(ruleData);
};

// Update alert rule with validation
const updateAlertRule = async (id, ruleData) => {
  const existingRule = await alertsRepository.findAlertRuleById(id);
  if (!existingRule) {
    throw new Error("Alert rule not found");
  }

  // Validate threshold if provided
  if (ruleData.threshold !== undefined && ruleData.threshold <= 0) {
    throw new Error("Threshold must be greater than 0");
  }

  // Validate rule type if provided
  if (ruleData.rule_type) {
    const validRuleTypes = [
      "NOT_DISPATCHED_IN_X_DAYS",
      "NOT_DELIVERED_SAME_DAY",
    ];
    if (!validRuleTypes.includes(ruleData.rule_type)) {
      throw new Error(
        "Invalid rule type. Must be one of: NOT_DISPATCHED_IN_X_DAYS, NOT_DELIVERED_SAME_DAY"
      );
    }

    // Check for duplicate active rules (excluding current rule)
    const existingRules = await alertsRepository.findAllAlertRules({
      skip: 0,
      take: 1000,
    });
    const duplicateRule = existingRules.find(
      (rule) =>
        rule.id !== parseInt(id) &&
        rule.rule_type === ruleData.rule_type &&
        rule.active === true
    );

    if (duplicateRule) {
      throw new Error(
        `An active rule of type '${ruleData.rule_type}' already exists`
      );
    }
  }

  return await alertsRepository.updateAlertRule(id, ruleData);
};

// Delete alert rule
const deleteAlertRule = async (id) => {
  const rule = await alertsRepository.findAlertRuleById(id);
  if (!rule) {
    throw new Error("Alert rule not found");
  }

  await alertsRepository.deleteAlertRule(id);
  return { message: "Alert rule deleted successfully" };
};

// Toggle alert rule status
const toggleAlertRuleStatus = async (id) => {
  const rule = await alertsRepository.findAlertRuleById(id);
  if (!rule) {
    throw new Error("Alert rule not found");
  }

  const newStatus = !rule.active;

  // Check for duplicate active rules if activating
  if (newStatus) {
    const existingRules = await alertsRepository.findAllAlertRules({
      skip: 0,
      take: 1000,
    });
    const duplicateRule = existingRules.find(
      (existingRule) =>
        existingRule.id !== parseInt(id) &&
        existingRule.rule_type === rule.rule_type &&
        existingRule.active === true
    );

    if (duplicateRule) {
      throw new Error(
        `An active rule of type '${rule.rule_type}' already exists`
      );
    }
  }

  return await alertsRepository.updateAlertRule(id, { active: newStatus });
};

// Get active alert rules
const getActiveAlertRules = async () => {
  const allRules = await alertsRepository.findAllAlertRules({
    skip: 0,
    take: 1000,
  });
  return allRules.filter((rule) => rule.active);
};

// Execute alert rules against orders
const executeAlertRules = async () => {
  const activeRules = await getActiveAlertRules();
  const orders = await ordersRepository.findAll({
    skip: 0,
    take: 1000,
    filter: {},
  });

  const createdAlerts = [];

  for (const rule of activeRules) {
    for (const order of orders) {
      let shouldCreateAlert = false;
      let alertMessage = "";

      switch (rule.rule_type) {
        case "NOT_DISPATCHED_IN_X_DAYS":
          if (order.status === "CREATED" || order.status === "PREPARING") {
            const daysSinceCreation = Math.floor(
              (new Date() - new Date(order.created_at)) / (1000 * 60 * 60 * 24)
            );
            if (daysSinceCreation >= rule.threshold) {
              shouldCreateAlert = true;
              alertMessage = `Pedido ${order.id} ha estado en estado ${order.status} por ${daysSinceCreation} días (umbral: ${rule.threshold} días)`;
            }
          }
          break;

        case "NOT_DELIVERED_SAME_DAY":
          if (order.status !== "DELIVERED") {
            const orderDate = new Date(order.created_at);
            const today = new Date();
            const isSameDay = orderDate.toDateString() === today.toDateString();

            if (isSameDay && today.getHours() >= 18) {
              shouldCreateAlert = true;
              alertMessage = `Pedido ${order.id} creado hoy no ha sido entregado (estado actual: ${order.status})`;
            }
          }
          break;
      }

      if (shouldCreateAlert) {
        // Check if alert already exists for this order and rule type
        const existingAlerts = await alertsRepository.findAlertsByOrderId(
          order.id
        );
        const alertExists = existingAlerts.some(
          (alert) => alert.alert_type === rule.rule_type && !alert.resolved
        );

        if (!alertExists) {
          const newAlert = await alertsRepository.createAlert({
            order_id: order.id,
            alert_type: rule.rule_type,
            message: alertMessage,
          });

          createdAlerts.push(newAlert);

          // Crear notificación automáticamente
          await notificationsService.createAlertNotification(
            newAlert,
            order.user_id
          );

          // Enviar notificación administrativa
          await notificationsService.createAdminNotification(
            `Alerta Automática: ${rule.rule_type}`,
            alertMessage,
            {
              order_id: order.id,
              rule_type: rule.rule_type,
              threshold: rule.threshold,
            }
          );
        }
      }
    }
  }

  return {
    message: `Executed ${activeRules.length} active rules against ${orders.length} orders`,
    createdAlerts: createdAlerts.length,
    alerts: createdAlerts,
  };
};

// Get alert rule statistics
const getAlertRuleStats = async () => {
  const allRules = await alertsRepository.findAllAlertRules({
    skip: 0,
    take: 1000,
  });
  const activeRules = allRules.filter((rule) => rule.active);
  const inactiveRules = allRules.filter((rule) => !rule.active);

  return {
    total: allRules.length,
    active: activeRules.length,
    inactive: inactiveRules.length,
    byType: {
      NOT_DISPATCHED_IN_X_DAYS: allRules.filter(
        (rule) => rule.rule_type === "NOT_DISPATCHED_IN_X_DAYS"
      ).length,
      NOT_DELIVERED_SAME_DAY: allRules.filter(
        (rule) => rule.rule_type === "NOT_DELIVERED_SAME_DAY"
      ).length,
    },
  };
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
  getAlertRuleStats,
};
