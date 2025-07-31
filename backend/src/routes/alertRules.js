const express = require("express");
const router = express.Router();
const {
  getAllAlertRules,
  getAlertRuleById,
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
  toggleAlertRuleStatus,
  getActiveAlertRules,
  executeAlertRules,
  getAlertRuleStats,
  updateAlertRuleThreshold,
} = require("../controllers/alertRules.controller");

/**
 * @swagger
 * components:
 *   schemas:
 *     AlertRule:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Rule ID
 *           example: 1
 *         rule_type:
 *           type: string
 *           enum: [NOT_DISPATCHED_IN_X_DAYS, NOT_DELIVERED_SAME_DAY]
 *           description: Type of alert rule
 *           example: "NOT_DISPATCHED_IN_X_DAYS"
 *         threshold:
 *           type: integer
 *           description: Threshold value in days or hours
 *           example: 3
 *         active:
 *           type: boolean
 *           description: Whether rule is active
 *           example: true
 *         user_id:
 *           type: string
 *           description: User ID associated with the rule (optional)
 *           example: "user-123"
 *     CreateAlertRuleRequest:
 *       type: object
 *       required:
 *         - rule_type
 *         - threshold
 *       properties:
 *         rule_type:
 *           type: string
 *           enum: [NOT_DISPATCHED_IN_X_DAYS, NOT_DELIVERED_SAME_DAY]
 *           description: Type of alert rule
 *           example: "NOT_DISPATCHED_IN_X_DAYS"
 *         threshold:
 *           type: integer
 *           description: Threshold value in days or hours
 *           example: 3
 *         active:
 *           type: boolean
 *           description: Whether rule is active
 *           default: true
 *           example: true
 *         user_id:
 *           type: string
 *           description: User ID associated with the rule (optional)
 *           example: "user-123"
 *     UpdateAlertRuleRequest:
 *       type: object
 *       properties:
 *         rule_type:
 *           type: string
 *           enum: [NOT_DISPATCHED_IN_X_DAYS, NOT_DELIVERED_SAME_DAY]
 *           description: Type of alert rule
 *         threshold:
 *           type: integer
 *           description: Threshold value in days or hours
 *         active:
 *           type: boolean
 *           description: Whether rule is active
 *         user_id:
 *           type: string
 *           description: User ID associated with the rule (optional)
 *     AlertRuleStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total number of rules
 *           example: 5
 *         active:
 *           type: integer
 *           description: Number of active rules
 *           example: 3
 *         inactive:
 *           type: integer
 *           description: Number of inactive rules
 *           example: 2
 *         byType:
 *           type: object
 *           properties:
 *             NOT_DISPATCHED_IN_X_DAYS:
 *               type: integer
 *               description: Number of NOT_DISPATCHED_IN_X_DAYS rules
 *               example: 3
 *             NOT_DELIVERED_SAME_DAY:
 *               type: integer
 *               description: Number of NOT_DELIVERED_SAME_DAY rules
 *               example: 2
 *     ExecuteAlertRulesResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Execution summary
 *           example: "Executed 3 active rules against 25 orders"
 *         createdAlerts:
 *           type: integer
 *           description: Number of alerts created
 *           example: 5
 *         alerts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Alert'
 *           description: Array of created alerts
 */

/**
 * @swagger
 * tags:
 *   name: Alert Rules
 *   description: Alert rule management and execution endpoints
 */

/**
 * @swagger
 * /alert-rules:
 *   get:
 *     summary: Get all alert rules
 *     description: Retrieve a list of all alert rules with pagination
 *     tags: [Alert Rules]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of rules per page
 *     responses:
 *       200:
 *         description: List of alert rules retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AlertRule'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", getAllAlertRules);

/**
 * @swagger
 * /alert-rules/active:
 *   get:
 *     summary: Get active alert rules
 *     description: Retrieve a list of all active alert rules
 *     tags: [Alert Rules]
 *     responses:
 *       200:
 *         description: Active alert rules retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AlertRule'
 *                 count:
 *                   type: integer
 *                   description: Number of active rules
 *                   example: 3
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/active", getActiveAlertRules);

/**
 * @swagger
 * /alert-rules/stats:
 *   get:
 *     summary: Get alert rule statistics
 *     description: Retrieve statistics about alert rules
 *     tags: [Alert Rules]
 *     responses:
 *       200:
 *         description: Alert rule statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AlertRuleStats'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/stats", getAlertRuleStats);

/**
 * @swagger
 * /alert-rules/execute:
 *   post:
 *     summary: Execute alert rules
 *     description: Execute all active alert rules against existing orders and create alerts where conditions are met
 *     tags: [Alert Rules]
 *     responses:
 *       200:
 *         description: Alert rules executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ExecuteAlertRulesResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/execute", executeAlertRules);

/**
 * @swagger
 * /alert-rules/execute-with-notifications:
 *   post:
 *     summary: Execute alert rules and create notifications
 *     description: Execute all active alert rules and create notifications for affected users
 *     tags: [Alert Rules]
 *     responses:
 *       200:
 *         description: Alert rules executed successfully with notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Executed 2 active rules against 15 orders"
 *                     createdAlerts:
 *                       type: integer
 *                       example: 3
 *                     createdNotifications:
 *                       type: integer
 *                       example: 5
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: integer
 *                           example: 15
 *                         activeRules:
 *                           type: integer
 *                           example: 2
 *                         alertsCreated:
 *                           type: integer
 *                           example: 3
 *                         notificationsSent:
 *                           type: integer
 *                           example: 5
 *                         uniqueUsersNotified:
 *                           type: integer
 *                           example: 3
 */
router.post("/execute-with-notifications", executeAlertRules);

/**
 * @swagger
 * /alert-rules:
 *   post:
 *     summary: Create a new alert rule
 *     description: Create a new alert rule for monitoring orders
 *     tags: [Alert Rules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAlertRuleRequest'
 *           example:
 *             rule_type: "NOT_DISPATCHED_IN_X_DAYS"
 *             threshold: 3
 *             active: true
 *             user_id: "user-123"
 *     responses:
 *       201:
 *         description: Alert rule created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AlertRule'
 *       400:
 *         description: Invalid request data or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", createAlertRule);

/**
 * @swagger
 * /alert-rules/{id}:
 *   get:
 *     summary: Get alert rule by ID
 *     description: Retrieve a specific alert rule by its ID
 *     tags: [Alert Rules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Alert rule ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Alert rule retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AlertRule'
 *       404:
 *         description: Alert rule not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", getAlertRuleById);

/**
 * @swagger
 * /alert-rules/{id}:
 *   put:
 *     summary: Update an alert rule
 *     description: Update an existing alert rule
 *     tags: [Alert Rules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Alert rule ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAlertRuleRequest'
 *           example:
 *             rule_type: "NOT_DISPATCHED_IN_X_DAYS"
 *             threshold: 3
 *             active: false
 *     responses:
 *       200:
 *         description: Alert rule updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AlertRule'
 *       400:
 *         description: Invalid request data or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Alert rule not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", updateAlertRule);

/**
 * @swagger
 * /alert-rules/{id}/toggle:
 *   patch:
 *     summary: Toggle alert rule status
 *     description: Toggle the active status of an alert rule
 *     tags: [Alert Rules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Alert rule ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Alert rule status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AlertRule'
 *                 message:
 *                   type: string
 *                   example: "Alert rule activated successfully"
 *       400:
 *         description: Cannot activate rule - duplicate active rule exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Alert rule not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/:id/toggle", toggleAlertRuleStatus);

/**
 * @swagger
 * /alert-rules/{id}:
 *   delete:
 *     summary: Delete an alert rule
 *     description: Delete an alert rule
 *     tags: [Alert Rules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Alert rule ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Alert rule deleted successfully
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
 *                   example: "Alert rule deleted successfully"
 *       404:
 *         description: Alert rule not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", deleteAlertRule);

/**
 * @swagger
 * /alert-rules/{id}/threshold:
 *   patch:
 *     summary: Update alert rule threshold
 *     description: Update the threshold value of an alert rule
 *     tags: [Alert Rules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Alert rule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               threshold:
 *                 type: integer
 *                 description: New threshold value
 *                 example: 5
 *     responses:
 *       200:
 *         description: Alert rule threshold updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AlertRule'
 *       400:
 *         description: Invalid request data or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Alert rule not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/:id/threshold", updateAlertRuleThreshold);

module.exports = router;
