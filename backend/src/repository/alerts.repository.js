const prisma = require("../config/prisma");

// Alert operations
const findAllAlerts = ({ skip, take, filter }) => {
  return prisma.alert.findMany({
    skip,
    take,
    where: {
      resolved: filter?.resolved !== undefined ? filter.resolved : undefined,
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
    orderBy: { triggered_at: "desc" },
  });
};

const findUnresolvedAlerts = ({ skip, take }) => {
  return prisma.alert.findMany({
    skip,
    take,
    where: { resolved: false },
    include: {
      order: {
        select: {
          id: true,
          customer_name: true,
          status: true,
        },
      },
    },
    orderBy: { triggered_at: "desc" },
  });
};

const findAlertById = (id) => {
  return prisma.alert.findUnique({
    where: { id: id },
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
};

const createAlert = (data) => {
  return prisma.alert.create({
    data: {
      ...data,
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
};

const updateAlert = (id, data) => {
  return prisma.alert.update({
    where: { id: id },
    data,
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
};

const resolveAlert = (id) => {
  return prisma.alert.update({
    where: { id: id },
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
};

const deleteAlert = (id) => {
  return prisma.alert.delete({
    where: { id: id },
  });
};

const countAlerts = (filter) => {
  return prisma.alert.count({
    where: {
      resolved: filter?.resolved !== undefined ? filter.resolved : undefined,
    },
  });
};

const countUnresolvedAlerts = () => {
  return prisma.alert.count({
    where: { resolved: false },
  });
};

// Alert rules operations
const findAllAlertRules = ({ skip, take }) => {
  return prisma.alertRule.findMany({
    skip,
    take,
    orderBy: { id: "asc" },
  });
};

const findAlertRuleById = (id) => {
  return prisma.alertRule.findUnique({
    where: { id: id },
  });
};

const createAlertRule = (data) => {
  return prisma.alertRule.create({
    data: {
      ...data,
      active: data.active !== undefined ? data.active : true,
    },
  });
};

const updateAlertRule = (id, data) => {
  return prisma.alertRule.update({
    where: { id: id },
    data,
  });
};

const deleteAlertRule = (id) => {
  return prisma.alertRule.delete({
    where: { id: id },
  });
};

const countAlertRules = () => {
  return prisma.alertRule.count();
};

module.exports = {
  // Alert operations
  findAllAlerts,
  findUnresolvedAlerts,
  findAlertById,
  createAlert,
  updateAlert,
  resolveAlert,
  deleteAlert,
  countAlerts,
  countUnresolvedAlerts,

  // Alert rules operations
  findAllAlertRules,
  findAlertRuleById,
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
  countAlertRules,
};
