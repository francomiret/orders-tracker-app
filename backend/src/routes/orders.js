const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderEvents,
  getOrderAlerts,
  getOrderStatusHistory,
  validateOrderStatusIntegrity,
} = require("../controllers/orders.controller");

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique order identifier (CUID)
 *           example: "cmdqjzodn0000y1i251v4cjj4"
 *         customer_name:
 *           type: string
 *           description: Customer name
 *           example: "John Doe"
 *         address:
 *           type: string
 *           description: Customer address
 *           example: "123 Main St, City, State"
 *         status:
 *           type: string
 *           enum: [CREATED, PREPARING, DISPATCHED, DELIVERED]
 *           description: Current order status
 *           example: "CREATED"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Order creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         events:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderEvent'
 *         alerts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Alert'
 *     OrderEvent:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Event ID
 *         order_id:
 *           type: string
 *           description: Order ID
 *         event_type:
 *           type: string
 *           enum: [CREATED, PREPARING, DISPATCHED, DELIVERED]
 *           description: Type of event
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Event timestamp
 *         event_id:
 *           type: string
 *           description: Unique event identifier for idempotency
 *     CreateOrderRequest:
 *       type: object
 *       required:
 *         - customer_name
 *       properties:
 *         customer_name:
 *           type: string
 *           description: Customer name
 *           example: "John Doe"
 *         address:
 *           type: string
 *           description: Customer address
 *           example: "123 Main St, City, State"
 *     UpdateOrderStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [CREATED, PREPARING, DISPATCHED, DELIVERED]
 *           description: New order status
 *         eventId:
 *           type: string
 *           description: Optional unique event ID for idempotency
 *     OrderStatusHistory:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *           description: Order ID
 *         currentStatus:
 *           type: string
 *           description: Current order status
 *         statusHistory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               eventId:
 *                 type: string
 *     StatusIntegrityValidation:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *         isValid:
 *           type: boolean
 *         violations:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               issue:
 *                 type: string
 
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *     PaginationInfo:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: Current page number
 *           example: 1
 *         limit:
 *           type: integer
 *           description: Number of items per page
 *           example: 10
 *         total:
 *           type: integer
 *           description: Total number of items
 *           example: 25
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *           example: 3
 */

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints with business rules
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     description: Retrieve a list of all orders with their events and unresolved alerts, with pagination support
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: customer_name
 *         schema:
 *           type: string
 *         description: Filter orders by customer name
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
 *         description: Number of orders per page
 *     responses:
 *       200:
 *         description: List of orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", getAllOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Retrieve a specific order by its ID with all events and alerts
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID (CUID)
 *         example: "cmdqjzodn0000y1i251v4cjj4"
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
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
router.get("/:id", getOrderById);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     description: Create a new order with initial CREATED status and event
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *           example:
 *             customer_name: "John Doe"
 *             address: "123 Main St, City, State"
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
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
router.post("/", createOrder);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     description: Update the status of an order with business rules validation (sequential progression, idempotency)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID (CUID)
 *         example: "cmdqjzodn0000y1i251v4cjj4"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatusRequest'
 *           example:
 *             status: "PREPARING"
 *             eventId: "optional-unique-event-id"
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 eventId:
 *                   type: string
 *       400:
 *         description: Invalid status value, invalid transition, or validation error
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
router.patch("/:id/status", updateOrderStatus);

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete order
 *     description: Delete an order and all its associated events and alerts
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID (CUID)
 *         example: "cmdqjzodn0000y1i251v4cjj4"
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order deleted successfully"
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
router.delete("/:id", deleteOrder);

/**
 * @swagger
 * /orders/{id}/events:
 *   get:
 *     summary: Get order events
 *     description: Retrieve all events for a specific order (audit trail)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID (CUID)
 *         example: "cmdqjzodn0000y1i251v4cjj4"
 *     responses:
 *       200:
 *         description: Order events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderEvent'
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
router.get("/:id/events", getOrderEvents);

/**
 * @swagger
 * /orders/{id}/alerts:
 *   get:
 *     summary: Get order alerts
 *     description: Retrieve all alerts for a specific order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID (CUID)
 *         example: "cmdqjzodn0000y1i251v4cjj4"
 *     responses:
 *       200:
 *         description: Order alerts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Alert'
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
router.get("/:id/alerts", getOrderAlerts);

/**
 * @swagger
 * /orders/{id}/status-history:
 *   get:
 *     summary: Get order status history
 *     description: Retrieve complete status change history for an order with timestamps and event IDs
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID (CUID)
 *         example: "cmdqjzodn0000y1i251v4cjj4"
 *     responses:
 *       200:
 *         description: Order status history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderStatusHistory'
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
router.get("/:id/status-history", getOrderStatusHistory);

/**
 * @swagger
 * /orders/{id}/validate-integrity:
 *   get:
 *     summary: Validate order status integrity
 *     description: Validate that the order's status progression follows the sequential business rules
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID (CUID)
 *         example: "cmdqjzodn0000y1i251v4cjj4"
 *     responses:
 *       200:
 *         description: Order status integrity validation completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatusIntegrityValidation'
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
router.get("/:id/validate-integrity", validateOrderStatusIntegrity);

module.exports = router;
