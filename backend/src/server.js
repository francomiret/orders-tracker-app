const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

// Import configurations and middleware
const swaggerSpecs = require("./config/swagger");
const {
  errorHandler,
  notFoundHandler,
  validationErrorHandler,
  databaseErrorHandler,
  rateLimitErrorHandler,
  unhandledErrorHandler,
} = require("./middleware/errorHandler");

// Import routes
const pingRoutes = require("./routes/ping");
const healthRoutes = require("./routes/health");
const ordersRoutes = require("./routes/orders");
const alertRulesRoutes = require("./routes/alertRules");
const notificationsRoutes = require("./routes/notifications");
const { initializeWebSocket } = require("./websocket");

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://domain.com"]
        : ["http://localhost:5173", "http://localhost:3001"],
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Orders Tracker API Documentation",
  })
);

// Routes
app.use("/api/ping", pingRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/alert-rules", alertRulesRoutes);
app.use("/api/notifications", notificationsRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Orders Tracker API",
    version: "1.0.0",
    documentation: "/api-docs",
    ping: "/api/ping",
    health: "/api/health",
  });
});

// Error handling middleware
app.use(validationErrorHandler);
app.use(databaseErrorHandler);
app.use(rateLimitErrorHandler);
app.use(errorHandler);

// 404 handler (must be last)
app.use(notFoundHandler);

// Unhandled error handler (must be very last)
app.use(unhandledErrorHandler);

// Start server
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
  console.log(
    `📚 API Documentation available at http://localhost:${PORT}/api-docs`
  );
  console.log(
    `🏓 Ping endpoint available at http://localhost:${PORT}/api/ping`
  );
  console.log(
    `🏥 Health check available at http://localhost:${PORT}/api/health`
  );
  console.log(`📦 Orders API available at http://localhost:${PORT}/api/orders`);
  console.log(`🚨 Alerts API available at http://localhost:${PORT}/api/alerts`);
  console.log(
    `⚙️ Alert Rules API available at http://localhost:${PORT}/api/alert-rules`
  );
  console.log(
    `📬 Notifications API available at http://localhost:${PORT}/api/notifications`
  );
});

// Inicializar WebSocket
initializeWebSocket(server);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to uncaught exception");
  process.exit(1);
});

module.exports = app;
