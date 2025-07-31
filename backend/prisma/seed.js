const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create sample orders with different scenarios for testing notifications
  const order1 = await prisma.order.create({
    data: {
      customer_name: "John Doe",
      status: "CREATED",
      user_id: "user-123",
      events: {
        create: [
          {
            event_type: "CREATED",
            timestamp: new Date(Date.now() - 432000000), // 5 days ago
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
      user_id: "user-456",
      events: {
        create: [
          {
            event_type: "CREATED",
            timestamp: new Date(Date.now() - 432000000), // 5 days ago
            user_id: "user-456",
          },
          {
            event_type: "PREPARING",
            timestamp: new Date(Date.now() - 432000000), // 5 days ago
            user_id: "user-456",
          },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      customer_name: "Bob Johnson",
      status: "DISPATCHED",
      user_id: "user-789",
      estimated_delivery_date: new Date(2025, 7, 21),
      events: {
        create: [
          {
            event_type: "CREATED",
            timestamp: new Date(Date.now() - 7200000), // 2 hours ago
            user_id: "user-789",
          },
          {
            event_type: "PREPARING",
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
            user_id: "user-789",
          },
          {
            event_type: "DISPATCHED",
            timestamp: new Date(),
            user_id: "user-789",
          },
        ],
      },
    },
  });

  // Create alert rules that will generate notifications
  const alertRule1 = await prisma.alertRule.create({
    data: {
      rule_type: "NOT_DISPATCHED_IN_X_DAYS",
      threshold: 3, // 3 days - will trigger for order1 and order2
      active: true,
      user_id: "admin-001",
    },
  });

  const alertRule2 = await prisma.alertRule.create({
    data: {
      rule_type: "NOT_DELIVERED_SAME_DAY",
      threshold: 1, // 1 day
      active: true,
      user_id: "admin-001",
    },
  });

  // Create sample notifications to demonstrate the system
  const notification1 = await prisma.notification.create({
    data: {
      user_id: "user-123",
      type: "ALERT_GENERATED",
      title: "🚨 Pedido Retrasado",
      message:
        "El pedido cmdr8fmo20000y1e934mybidd lleva 5 días sin ser despachado",
      data: {
        order_id: order1.id,
        alert_type: "NOT_DISPATCHED_IN_X_DAYS",
        severity: "high",
        days_since_creation: 5,
        customer_name: "John Doe",
        order_status: "CREATED",
        threshold: 3,
      },
      read: false,
    },
  });

  const notification2 = await prisma.notification.create({
    data: {
      user_id: "user-456",
      type: "ALERT_GENERATED",
      title: "⚠️ Pedido en Preparación",
      message:
        "El pedido cmdr8fmow0001y1e9vz19owkc lleva 5 días en preparación",
      data: {
        order_id: order2.id,
        alert_type: "NOT_DISPATCHED_IN_X_DAYS",
        severity: "high",
        days_since_creation: 5,
        customer_name: "Jane Smith",
        order_status: "PREPARING",
        threshold: 3,
      },
      read: false,
    },
  });

  const adminNotification = await prisma.notification.create({
    data: {
      user_id: null, // Admin notification
      type: "ADMIN_ALERT",
      title: "👨‍💼 Alerta Administrativa",
      message: "2 pedidos han excedido el umbral de 3 días sin despachar",
      data: {
        affected_orders: [order1.id, order2.id],
        rule_type: "NOT_DISPATCHED_IN_X_DAYS",
        threshold: 3,
        severity: "high",
        total_affected: 2,
      },
      read: false,
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("📦 Created orders:");
  console.log(`   - Order 1: ${order1.id} (John Doe - CREATED - 5 days old)`);
  console.log(
    `   - Order 2: ${order2.id} (Jane Smith - PREPARING - 5 days old)`
  );
  console.log(`   - Order 3: ${order3.id} (Bob Johnson - DISPATCHED - recent)`);

  console.log("\n🔔 Created alert rules:");
  console.log(`   - Rule 1: NOT_DISPATCHED_IN_X_DAYS (threshold: 3 days)`);
  console.log(`   - Rule 2: NOT_DELIVERED_SAME_DAY (threshold: 1 day)`);

  console.log("\n📢 Created sample notifications:");
  console.log(`   - User notification 1: ${notification1.id} (user-123)`);
  console.log(`   - User notification 2: ${notification2.id} (user-456)`);
  console.log(`   - Admin notification: ${adminNotification.id}`);

  console.log("\n🧪 Para probar el sistema:");
  console.log(
    "   1. Ejecutar: POST /api/alert-rules/execute-with-notifications"
  );
  console.log("   2. Verificar: GET /api/notifications/user-123");
  console.log("   3. Verificar: GET /api/notifications/user-456");
  console.log("   4. Estadísticas: GET /api/notifications/user-123/stats");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
