# Prisma Setup and Usage

This project uses Prisma as the ORM for PostgreSQL database management, implementing the schema defined in the TypeScript models.

## Prerequisites

- Node.js and npm installed
- Docker and Docker Compose (for local PostgreSQL)
- Copy `.env` from `env.template` and configure your environment variables

## Initial Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start PostgreSQL database:**

   ```bash
   npm run docker:up
   ```

3. **Generate Prisma client:**

   ```bash
   npm run prisma:generate
   ```

4. **Run database migrations:**

   ```bash
   npm run prisma:migrate
   ```

5. **Seed the database (optional):**

   ```bash
   npm run prisma:seed
   ```

## Available Scripts

- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:migrate:deploy` - Deploy migrations to production
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed database with sample data
- `npm run db:setup` - Complete database setup (docker up + migrate)

## Database Models

### Order

- `id` - Unique identifier (CUID)
- `customer_name` - Customer name (optional)
- `status` - Order status (CREATED, PREPARING, DISPATCHED, DELIVERED)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `events` - Related order events
- `alerts` - Related alerts

### OrderEvent

- `id` - Auto-incrementing integer ID
- `order_id` - Reference to parent order
- `event_type` - Type of event (CREATED, PREPARING, DISPATCHED, DELIVERED)
- `timestamp` - Event timestamp
- `order` - Related order

### AlertRule

- `id` - Auto-incrementing integer ID
- `rule_type` - Type of alert rule (NOT_DISPATCHED_IN_X_DAYS, NOT_DELIVERED_SAME_DAY)
- `threshold` - Threshold value in days or hours
- `active` - Whether the rule is active

### Alert

- `id` - Auto-incrementing integer ID
- `order_id` - Reference to related order
- `alert_type` - Type of alert
- `message` - Alert message
- `triggered_at` - When the alert was triggered
- `resolved` - Whether the alert is resolved
- `order` - Related order

## Enums

### OrderStatus

- `CREATED`
- `PREPARING`
- `DISPATCHED`
- `DELIVERED`

### OrderEventType

- `CREATED`
- `PREPARING`
- `DISPATCHED`
- `DELIVERED`

### AlertRuleType

- `NOT_DISPATCHED_IN_X_DAYS`
- `NOT_DELIVERED_SAME_DAY`

## Using Prisma in Your Code

```javascript
const prisma = require("./src/config/prisma");

// Create an order
const order = await prisma.order.create({
  data: {
    customer_name: "Alice Johnson",
    status: "CREATED",
    events: {
      create: [
        {
          event_type: "CREATED",
          timestamp: new Date(),
        },
      ],
    },
  },
});

// Get all orders with events and alerts
const orders = await prisma.order.findMany({
  include: {
    events: {
      orderBy: {
        timestamp: "desc",
      },
    },
    alerts: {
      where: {
        resolved: false,
      },
    },
  },
});

// Update order status and create event
const updatedOrder = await prisma.order.update({
  where: { id: order.id },
  data: {
    status: "PREPARING",
    events: {
      create: [
        {
          event_type: "PREPARING",
          timestamp: new Date(),
        },
      ],
    },
  },
});
```

## API Endpoints

### Orders

- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get specific order
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order
- `GET /api/orders/:id/events` - Get order events
- `GET /api/orders/:id/alerts` - Get order alerts

### Alerts

- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/unresolved` - Get unresolved alerts
- `POST /api/alerts` - Create new alert
- `PATCH /api/alerts/:id/resolve` - Resolve alert

### Alert Rules

- `GET /api/alerts/rules` - Get all alert rules
- `POST /api/alerts/rules` - Create new alert rule
- `PUT /api/alerts/rules/:id` - Update alert rule
- `DELETE /api/alerts/rules/:id` - Delete alert rule

## Environment Variables

Make sure your `.env` file contains:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/orders_tracker?schema=public"
```

## Prisma Studio

To view and edit your data through a web interface:

```bash
npm run prisma:studio
```

This will open Prisma Studio at `http://localhost:5555`

## Troubleshooting

1. **Database connection issues:**

   - Ensure PostgreSQL is running: `npm run docker:up`
   - Check your `.env` file has the correct DATABASE_URL

2. **Migration issues:**

   - Reset database: `npx prisma migrate reset`
   - Check migration status: `npx prisma migrate status`

3. **Client generation issues:**

   - Regenerate client: `npm run prisma:generate`
   - Restart your development server
