const express = require("express");
const router = express.Router();
const db = require("../config/database");

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Database health check
 *     description: Check if the database connection is working properly
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Database connection successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Database connection successful
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Current database timestamp
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *       500:
 *         description: Database connection failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Database connection failed
 *                 error:
 *                   type: string
 *                   description: Error message from database
 */
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW() as current_time");
    res.status(200).json({
      success: true,
      message: "Database connection successful",
      timestamp: result.rows[0].current_time,
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

module.exports = router;
