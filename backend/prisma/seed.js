const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create sample orders
  const order1 = await prisma.order.create({
    data: {
      customer_name: "John Doe",
      status: "CREATED",
      events: {
        create: [
          {
            event_type: "CREATED",
            timestamp: new Date(Date.now() - 432000000),
            user_id: "user-123",
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      customer_name: "Jane Smith",
      status: "PREPARING",
      events: {
        create: [
          {
            event_type: "CREATED",
            timestamp: new Date(Date.now() - 432000000),
            user_id: "user-123",
          },
          {
            event_type: "PREPARING",
            timestamp: new Date(Date.now() - 432000000),
            user_id: "user-123",
          },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      customer_name: "Bob Johnson",
      status: "DISPATCHED",
      estimated_delivery_date: new Date(2025, 7, 21),
      events: {
        create: [
          {
            event_type: "CREATED",
            timestamp: new Date(Date.now() - 7200000),
            user_id: "user-123",
          },
          {
            event_type: "PREPARING",
            timestamp: new Date(Date.now() - 3600000),
            user_id: "user-123",
          },
          {
            event_type: "DISPATCHED",
            timestamp: new Date(),
            user_id: "user-123",
          },
        ],
      },
    },
  });

  // Create alert rules
  const alertRule1 = await prisma.alertRule.create({
    data: {
      rule_type: "NOT_DISPATCHED_IN_X_DAYS",
      threshold: 2, // 2 days
      active: true,
      user_id: "user-123",
    },
  });

  const alertRule2 = await prisma.alertRule.create({
    data: {
      rule_type: "NOT_DELIVERED_SAME_DAY",
      threshold: 24, // 24 hours
      active: true,
      user_id: "user-123",
    },
  });

  // Create sample alerts
  const alert1 = await prisma.alert.create({
    data: {
      order_id: order1.id,
      alert_type: "DELAYED_PREPARATION",
      message: "Order has been in CREATED status for more than 1 hour",
      triggered_at: new Date(),
      resolved: false,
      user_id: "user-123",
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("Created orders:", {
    order1: order1.id,
    order2: order2.id,
    order3: order3.id,
  });
  console.log("Created alert rules:", {
    rule1: alertRule1.id,
    rule2: alertRule2.id,
  });
  console.log("Created alerts:", {
    alert1: alert1.id,
  });
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
