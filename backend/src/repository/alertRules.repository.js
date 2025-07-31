const prisma = require("../config/prisma");

// Get all alert rules with pagination
const findAllAlertRules = ({ skip, take }) => {
  return prisma.alertRule.findMany({
    skip,
    take,
    orderBy: { created_at: "desc" },
  });
};

// Get alert rule by ID
const findAlertRuleById = (id) => {
  return prisma.alertRule.findUnique({
    where: { id: parseInt(id) },
  });
};

// Create alert rule
const createAlertRule = (ruleData) => {
  return prisma.alertRule.create({
    data: ruleData,
  });
};

// Update alert rule
const updateAlertRule = (id, ruleData) => {
  return prisma.alertRule.update({
    where: { id: parseInt(id) },
    data: ruleData,
  });
};

// Delete alert rule
const deleteAlertRule = (id) => {
  return prisma.alertRule.delete({
    where: { id: parseInt(id) },
  });
};

// Count total alert rules
const countAlertRules = () => {
  return prisma.alertRule.count();
};

// Get active alert rules
const findActiveAlertRules = () => {
  return prisma.alertRule.findMany({
    where: { active: true },
    orderBy: { created_at: "desc" },
  });
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
