const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Ping endpoint
 *     description: Simple ping endpoint to check if the API is running
 *     tags: [Ping]
 *     responses:
 *       200:
 *         description: API is responding
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
 *                   example: pong
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 */
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "pong",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;
