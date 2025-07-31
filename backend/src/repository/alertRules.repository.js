const prisma = require("../config/prisma");
const {
  AlertRuleNotFoundError,
  AlertRuleValidationError,
  DatabaseError,
  DatabaseQueryError,
  RepositoryError,
  logErrorWithContext,
} = require("../utils/errors");

// Get all alert rules with pagination
const findAllAlertRules = async ({ skip, take }) => {
  try {
    const rules = await prisma.alertRule.findMany({
      skip,
      take,
      orderBy: { created_at: "desc" },
    });
    
    return rules;
  } catch (error) {
    logErrorWithContext(error, { operation: "findAllAlertRules", skip, take });
    throw new DatabaseQueryError(
      "Failed to fetch alert rules",
      "findAllAlertRules"
    );
  }
};

// Get alert rule by ID
const findAlertRuleById = async (id) => {
  try {
    if (!id || isNaN(parseInt(id))) {
      throw new AlertRuleValidationError("Invalid alert rule ID", "id");
    }

    const rule = await prisma.alertRule.findUnique({
      where: { id: parseInt(id) },
    });

    if (!rule) {
      throw new AlertRuleNotFoundError(id);
    }

    return rule;
  } catch (error) {
    if (error instanceof AlertRuleNotFoundError || error instanceof AlertRuleValidationError) {
      throw error;
    }
    
    logErrorWithContext(error, { operation: "findAlertRuleById", id });
    throw new DatabaseQueryError(
      "Failed to fetch alert rule by ID",
      "findAlertRuleById"
    );
  }
};

// Create alert rule
const createAlertRule = async (ruleData) => {
  try {
    // Validate required fields
    if (!ruleData.rule_type) {
      throw new AlertRuleValidationError("Rule type is required", "rule_type");
    }
    
    if (!ruleData.threshold || ruleData.threshold <= 0) {
      throw new AlertRuleValidationError("Threshold must be greater than 0", "threshold");
    }

    const rule = await prisma.alertRule.create({
      data: ruleData,
    });

    return rule;
  } catch (error) {
    if (error instanceof AlertRuleValidationError) {
      throw error;
    }
    
    if (error.code === 'P2002') {
      throw new AlertRuleValidationError("Alert rule with this configuration already exists");
    }
    
    logErrorWithContext(error, { operation: "createAlertRule", ruleData });
    throw new DatabaseQueryError(
      "Failed to create alert rule",
      "createAlertRule"
    );
  }
};

// Update alert rule
const updateAlertRule = async (id, ruleData) => {
  try {
    if (!id || isNaN(parseInt(id))) {
      throw new AlertRuleValidationError("Invalid alert rule ID", "id");
    }

    // Validate threshold if provided
    if (ruleData.threshold !== undefined && ruleData.threshold <= 0) {
      throw new AlertRuleValidationError("Threshold must be greater than 0", "threshold");
    }

    const rule = await prisma.alertRule.update({
      where: { id: parseInt(id) },
      data: ruleData,
    });

    return rule;
  } catch (error) {
    if (error instanceof AlertRuleValidationError) {
      throw error;
    }
    
    if (error.code === 'P2025') {
      throw new AlertRuleNotFoundError(id);
    }
    
    if (error.code === 'P2002') {
      throw new AlertRuleValidationError("Alert rule with this configuration already exists");
    }
    
    logErrorWithContext(error, { operation: "updateAlertRule", id, ruleData });
    throw new DatabaseQueryError(
      "Failed to update alert rule",
      "updateAlertRule"
    );
  }
};

// Delete alert rule
const deleteAlertRule = async (id) => {
  try {
    if (!id || isNaN(parseInt(id))) {
      throw new AlertRuleValidationError("Invalid alert rule ID", "id");
    }

    const rule = await prisma.alertRule.delete({
      where: { id: parseInt(id) },
    });

    return rule;
  } catch (error) {
    if (error instanceof AlertRuleValidationError) {
      throw error;
    }
    
    if (error.code === 'P2025') {
      throw new AlertRuleNotFoundError(id);
    }
    
    logErrorWithContext(error, { operation: "deleteAlertRule", id });
    throw new DatabaseQueryError(
      "Failed to delete alert rule",
      "deleteAlertRule"
    );
  }
};

// Count total alert rules
const countAlertRules = async () => {
  try {
    const count = await prisma.alertRule.count();
    return count;
  } catch (error) {
    logErrorWithContext(error, { operation: "countAlertRules" });
    throw new DatabaseQueryError(
      "Failed to count alert rules",
      "countAlertRules"
    );
  }
};

// Get active alert rules
const findActiveAlertRules = async () => {
  try {
    const rules = await prisma.alertRule.findMany({
      where: { active: true },
      orderBy: { created_at: "desc" },
    });
    
    return rules;
  } catch (error) {
    logErrorWithContext(error, { operation: "findActiveAlertRules" });
    throw new DatabaseQueryError(
      "Failed to fetch active alert rules",
      "findActiveAlertRules"
    );
  }
};

// Get alert rules by type
const findAlertRulesByType = (ruleType) => {
  return prisma.alertRule.findMany({
    where: { rule_type: ruleType },
    orderBy: { created_at: "desc" },
  });
};

// Get alert rules by user
const findAlertRulesByUser = (userId) => {
  return prisma.alertRule.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });
};

// Check if active rule of type exists
const checkActiveRuleExists = async (ruleType, excludeId = null) => {
  const where = {
    rule_type: ruleType,
    active: true,
  };

  if (excludeId) {
    where.id = { not: parseInt(excludeId) };
  }

  const existingRule = await prisma.alertRule.findFirst({ where });
  return !!existingRule;
};

// Get alert rule statistics
const getAlertRuleStats = async () => {
  const [total, active, inactive] = await Promise.all([
    prisma.alertRule.count(),
    prisma.alertRule.count({ where: { active: true } }),
    prisma.alertRule.count({ where: { active: false } }),
  ]);

  const byType = await prisma.alertRule.groupBy({
    by: ["rule_type"],
    _count: {
      rule_type: true,
    },
  });

  const stats = {
    total,
    active,
    inactive,
    byType: {},
  };

  byType.forEach((type) => {
    stats.byType[type.rule_type] = type._count.rule_type;
  });

  return stats;
};

// Bulk operations
const bulkUpdateAlertRules = async (updates) => {
  const results = [];

  for (const update of updates) {
    try {
      const result = await prisma.alertRule.update({
        where: { id: parseInt(update.id) },
        data: update.data,
      });
      results.push({ success: true, data: result });
    } catch (error) {
      results.push({ success: false, error: error.message, id: update.id });
    }
  }

  return results;
};

// Search alert rules
const searchAlertRules = async (searchTerm, options = {}) => {
  const { skip = 0, take = 50, active = null } = options;

  const where = {};

  if (searchTerm) {
    where.OR = [
      { rule_type: { contains: searchTerm, mode: "insensitive" } },
      { user_id: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  if (active !== null) {
    where.active = active;
  }

  return prisma.alertRule.findMany({
    where,
    skip,
    take,
    orderBy: { created_at: "desc" },
  });
};

module.exports = {
  findAllAlertRules,
  findAlertRuleById,
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
  countAlertRules,
  findActiveAlertRules,
  findAlertRulesByType,
  findAlertRulesByUser,
  checkActiveRuleExists,
  getAlertRuleStats,
  bulkUpdateAlertRules,
  searchAlertRules,
};
