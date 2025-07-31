const express = require("express");
const router = express.Router();
const {
  getAllAlerts,
  getUnresolvedAlerts,
  resolveAlert,
  createAlert,
  getAllAlertRules,
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
} = require("../controllers/alerts.controller");

/**
 * @swagger
 * components:
 *   schemas:
 *     Alert:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Alert ID
 *           example: 1
 *         order_id:
 *           type: string
 *           description: Order ID (CUID)
 *           example: "cmdqjzodn0000y1i251v4cjj4"
 *         alert_type:
 *           type: string
 *           description: Type of alert
 *           example: "DELAYED_PREPARATION"
 *         message:
 *           type: string
 *           description: Alert message
 *           example: "Order has been in CREATED status for more than 1 hour"
 *         triggered_at:
 *           type: string
 *           format: date-time
 *           description: When alert was triggered
 *         resolved:
 *           type: boolean
 *           description: Whether alert is resolved
 *           example: false
 *         order:
 *           $ref: '#/components/schemas/OrderSummary'
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
 *           example: 2
 *         active:
 *           type: boolean
 *           description: Whether rule is active
 *           example: true
 *     OrderSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Order ID
 *         customer_name:
 *           type: string
 *           description: Customer name
 *         status:
 *           type: string
 *           enum: [CREATED, PREPARING, DISPATCHED, DELIVERED]
 *           description: Order status
 *     CreateAlertRequest:
 *       type: object
 *       required:
 *         - order_id
 *         - alert_type
 *         - message
 *       properties:
 *         order_id:
 *           type: string
 *           description: Order ID (CUID)
 *           example: "cmdqjzodn0000y1i251v4cjj4"
 *         alert_type:
 *           type: string
 *           description: Type of alert
 *           example: "DELAYED_PREPARATION"
 *         message:
 *           type: string
 *           description: Alert message
 *           example: "Order has been in CREATED status for more than 1 hour"
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
 *           example: 2
 *         active:
 *           type: boolean
 *           description: Whether rule is active
 *           default: true
 *           example: true
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
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           description: Error message
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           description: Response data
 *         count:
 *           type: integer
 *           description: Number of items returned
 */

/**
 * @swagger
 * tags:
 *   name: Alerts
 *   description: Alert and alert rule management endpoints
 */

/**
 * @swagger
 * /alerts:
 *   get:
 *     summary: Get all alerts
 *     description: Retrieve a list of all alerts with order information
 *     tags: [Alerts]
 *     parameters:
 *       - in: query
 *         name: resolved
 *         schema:
 *           type: boolean
 *         description: Filter alerts by resolved status
 *       - in: query
 *         name: alert_type
 *         schema:
 *           type: string
 *         description: Filter alerts by type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of alerts to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of alerts to skip
 *     responses:
 *       200:
 *         description: List of alerts retrieved successfully
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
 *                     $ref: '#/components/schemas/Alert'
 *                 count:
 *                   type: integer
 *                   description: Total number of alerts
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", getAllAlerts);

/**
 * @swagger
 * /alerts/unresolved:
 *   get:
 *     summary: Get unresolved alerts
 *     description: Retrieve a list of all unresolved alerts with order information
 *     tags: [Alerts]
 *     parameters:
 *       - in: query
 *         name: alert_type
 *         schema:
 *           type: string
 *         description: Filter alerts by type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of alerts to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of alerts to skip
 *     responses:
 *       200:
 *         description: List of unresolved alerts retrieved successfully
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
 *                     $ref: '#/components/schemas/Alert'
 *                 count:
 *                   type: integer
 *                   description: Total number of unresolved alerts
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/unresolved", getUnresolvedAlerts);

/**
 * @swagger
 * /alerts:
 *   post:
 *     summary: Create a new alert
 *     description: Create a new alert for an order
 *     tags: [Alerts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAlertRequest'
 *           example:
 *             order_id: "cmdqjzodn0000y1i251v4cjj4"
 *             alert_type: "DELAYED_PREPARATION"
 *             message: "Order has been in CREATED status for more than 1 hour"
 *     responses:
 *       201:
 *         description: Alert created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Alert'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
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
router.post("/", createAlert);

/**
 * @swagger
 * /alerts/{id}/resolve:
 *   patch:
 *     summary: Resolve an alert
 *     description: Mark an alert as resolved
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Alert ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Alert resolved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Alert'
 *       404:
 *         description: Alert not found
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
router.patch("/:id/resolve", resolveAlert);

/**
 * @swagger
 * /alerts/rules:
 *   get:
 *     summary: Get all alert rules
 *     description: Retrieve a list of all alert rules
 *     tags: [Alerts]
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
 *                 count:
 *                   type: integer
 *                   description: Total number of alert rules
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/rules", getAllAlertRules);

/**
 * @swagger
 * /alerts/rules:
 *   post:
 *     summary: Create a new alert rule
 *     description: Create a new alert rule for monitoring orders
 *     tags: [Alerts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAlertRuleRequest'
 *           example:
 *             rule_type: "NOT_DISPATCHED_IN_X_DAYS"
 *             threshold: 2
 *             active: true
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
 *         description: Invalid request data
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
router.post("/rules", createAlertRule);

/**
 * @swagger
 * /alerts/rules/{id}:
 *   put:
 *     summary: Update an alert rule
 *     description: Update an existing alert rule
 *     tags: [Alerts]
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
 *         description: Invalid request data
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
router.put("/rules/:id", updateAlertRule);

/**
 * @swagger
 * /alerts/rules/{id}:
 *   delete:
 *     summary: Delete an alert rule
 *     description: Delete an alert rule
 *     tags: [Alerts]
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
router.delete("/rules/:id", deleteAlertRule);

module.exports = router;
