const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

// Import configurations and middleware
const swaggerSpecs = require("./config/swagger");
const errorHandler = require("./middleware/errorHandler");

// Import routes
const pingRoutes = require("./routes/ping");

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
        : ["http://localhost:3000", "http://localhost:3001"],
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

// Ping route
app.use("/api/ping", pingRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Orders Tracker API",
    version: "1.0.0",
    documentation: "/api-docs",
    ping: "/api/ping",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(
    `API Documentation available at http://localhost:${PORT}/api-docs`
  );
});

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
