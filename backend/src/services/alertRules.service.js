const alertRulesRepository = require("../repository/alertRules.repository");
const ordersRepository = require("../repository/orders.repository");
const { parsePagination } = require("../utils/pagination");
const notificationsService = require("./notifications.service");

// Get all alert rules with pagination
const getAllAlertRules = async (query) => {
  const { skip, take } = parsePagination(query);

  const [rules, totalCount] = await Promise.all([
    alertRulesRepository.findAllAlertRules({ skip, take }),
    alertRulesRepository.countAlertRules(),
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
  const rule = await alertRulesRepository.findAlertRuleById(id);
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
  const ruleExists = await alertRulesRepository.checkActiveRuleExists(
    ruleData.rule_type
  );

  if (ruleExists) {
    throw new Error(
      `An active rule of type '${ruleData.rule_type}' already exists`
    );
  }

  return await alertRulesRepository.createAlertRule(ruleData);
};

// Update alert rule with validation
const updateAlertRule = async (id, ruleData) => {
  const existingRule = await alertRulesRepository.findAlertRuleById(id);
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
    const ruleExists = await alertRulesRepository.checkActiveRuleExists(
      ruleData.rule_type,
      id
    );

    if (ruleExists) {
      throw new Error(
        `An active rule of type '${ruleData.rule_type}' already exists`
      );
    }
  }

  return await alertRulesRepository.updateAlertRule(id, ruleData);
};

// Delete alert rule
const deleteAlertRule = async (id) => {
  const existingRule = await alertRulesRepository.findAlertRuleById(id);
  if (!existingRule) {
    throw new Error("Alert rule not found");
  }

  return await alertRulesRepository.deleteAlertRule(id);
};

// Toggle alert rule status
const toggleAlertRuleStatus = async (id) => {
  const existingRule = await alertRulesRepository.findAlertRuleById(id);
  if (!existingRule) {
    throw new Error("Alert rule not found");
  }

  const newStatus = !existingRule.active;

  // Check for duplicate active rules if activating
  if (newStatus) {
    const ruleExists = await alertRulesRepository.checkActiveRuleExists(
      existingRule.rule_type,
      id
    );

    if (ruleExists) {
      throw new Error(
        `An active rule of type '${existingRule.rule_type}' already exists`
      );
    }
  }

  return await alertRulesRepository.updateAlertRule(id, { active: newStatus });
};

// Get active alert rules
const getActiveAlertRules = async () => {
  return await alertRulesRepository.findActiveAlertRules();
};

// Execute alert rules and generate notifications
const executeAlertRules = async () => {
  const activeRules = await getActiveAlertRules();
  const orders = await ordersRepository.findAll({
    skip: 0,
    take: 1000,
    filter: {},
  });

  const createdNotifications = [];
  const notifiedUsers = new Set(); // Para evitar duplicados

  for (const rule of activeRules) {
    for (const order of orders) {
      let shouldCreateNotification = false;
      let notificationMessage = "";
      let severity = "medium"; // low, medium, high

      switch (rule.rule_type) {
        case "NOT_DISPATCHED_IN_X_DAYS":
          if (order.status === "CREATED" || order.status === "PREPARING") {
            const daysSinceCreation = Math.floor(
              (new Date() - new Date(order.created_at)) / (1000 * 60 * 60 * 24)
            );
            if (daysSinceCreation >= rule.threshold) {
              shouldCreateNotification = true;
              notificationMessage = `Pedido ${order.id} ha estado en estado ${order.status} por ${daysSinceCreation} días (umbral: ${rule.threshold} días)`;

              // Determinar severidad basada en días
              if (daysSinceCreation >= rule.threshold * 2) {
                severity = "high";
              } else if (daysSinceCreation >= rule.threshold * 1.5) {
                severity = "medium";
              } else {
                severity = "low";
              }
            }
          }
          break;

        case "NOT_DELIVERED_SAME_DAY":
          if (order.status !== "DELIVERED") {
            const orderDate = new Date(order.created_at);
            const today = new Date();
            const isSameDay = orderDate.toDateString() === today.toDateString();

            if (isSameDay && today.getHours() >= 18) {
              shouldCreateNotification = true;
              notificationMessage = `Pedido ${order.id} creado hoy no ha sido entregado (estado actual: ${order.status})`;
              severity = "high"; // Pedidos no entregados el mismo día son críticos
            }
          }
          break;
      }

      if (shouldCreateNotification) {
        // Crear notificación para el usuario específico si existe
        if (order.user_id) {
          const userNotificationKey = `${order.user_id}_${rule.rule_type}_${order.id}`;

          if (!notifiedUsers.has(userNotificationKey)) {
            const userNotification =
              await notificationsService.createNotification({
                user_id: order.user_id,
                type: "ALERT_GENERATED",
                title: `🚨 Alerta: ${rule.rule_type}`,
                message: notificationMessage,
                data: {
                  order_id: order.id,
                  alert_type: rule.rule_type,
                  severity: severity,
                  days_since_creation:
                    rule.rule_type === "NOT_DISPATCHED_IN_X_DAYS"
                      ? Math.floor(
                          (new Date() - new Date(order.created_at)) /
                            (1000 * 60 * 60 * 24)
                        )
                      : null,
                  customer_name: order.customer_name,
                  order_status: order.status,
                  threshold: rule.threshold,
                },
              });

            createdNotifications.push(userNotification);
            notifiedUsers.add(userNotificationKey);
          }
        }

        // Crear notificación administrativa
        const adminNotification =
          await notificationsService.createAdminNotification(
            `👨‍💼 Alerta Automática: ${rule.rule_type}`,
            notificationMessage,
            {
              order_id: order.id,
              rule_type: rule.rule_type,
              threshold: rule.threshold,
              severity: severity,
              customer_name: order.customer_name,
              order_status: order.status,
              user_id: order.user_id,
              days_since_creation:
                rule.rule_type === "NOT_DISPATCHED_IN_X_DAYS"
                  ? Math.floor(
                      (new Date() - new Date(order.created_at)) /
                        (1000 * 60 * 60 * 24)
                    )
                  : null,
            }
          );

        createdNotifications.push(adminNotification);
      }
    }
  }

  return {
    message: `Executed ${activeRules.length} active rules against ${orders.length} orders`,
    createdNotifications: createdNotifications.length,
    notifications: createdNotifications,
    summary: {
      totalOrders: orders.length,
      activeRules: activeRules.length,
      notificationsSent: createdNotifications.length,
      uniqueUsersNotified: notifiedUsers.size,
    },
  };
};

// Get alert rule statistics
const getAlertRuleStats = async () => {
  return await alertRulesRepository.getAlertRuleStats();
};

// Additional service functions using the new repository
const getAlertRulesByType = async (ruleType) => {
  return await alertRulesRepository.findAlertRulesByType(ruleType);
};

const getAlertRulesByUser = async (userId) => {
  return await alertRulesRepository.findAlertRulesByUser(userId);
};

const searchAlertRules = async (searchTerm, options = {}) => {
  return await alertRulesRepository.searchAlertRules(searchTerm, options);
};

const bulkUpdateAlertRules = async (updates) => {
  return await alertRulesRepository.bulkUpdateAlertRules(updates);
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
  getAlertRulesByType,
  getAlertRulesByUser,
  searchAlertRules,
  bulkUpdateAlertRules,
};
