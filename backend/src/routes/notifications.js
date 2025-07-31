const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getNotificationStats,
  deleteNotification,
} = require("../controllers/notifications.controller");

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Notification ID
 *           example: 1
 *         user_id:
 *           type: string
 *           description: User ID (null for admin notifications)
 *           example: "user-123"
 *         type:
 *           type: string
 *           enum: [ALERT_GENERATED, ORDER_STATUS_CHANGED, ADMIN_ALERT, SYSTEM_NOTIFICATION]
 *           description: Type of notification
 *           example: "ALERT_GENERATED"
 *         title:
 *           type: string
 *           description: Notification title
 *           example: "Alerta: Pedido no despachado"
 *         message:
 *           type: string
 *           description: Notification message
 *           example: "El pedido cmdqjzodn0000y1i251v4cjj4 ha estado en estado CREATED por 3 días"
 *         data:
 *           type: object
 *           description: Additional data in JSON format
 *           example: {"alert_id": 1, "order_id": "cmdqjzodn0000y1i251v4cjj4"}
 *         read:
 *           type: boolean
 *           description: Whether notification has been read
 *           example: false
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When notification was created
 *         read_at:
 *           type: string
 *           format: date-time
 *           description: When notification was read (null if unread)
 *     NotificationStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total number of notifications
 *           example: 15
 *         unread:
 *           type: integer
 *           description: Number of unread notifications
 *           example: 5
 *         read:
 *           type: integer
 *           description: Number of read notifications
 *           example: 10
 */

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management endpoints
 */

/**
 * @swagger
 * /notifications/{userId}:
 *   get:
 *     summary: Get user notifications
 *     description: Retrieve notifications for a specific user with pagination
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "user-123"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of notifications per page
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Return only unread notifications
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
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
 *                     $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:userId", getUserNotifications);

/**
 * @swagger
 * /notifications/{userId}/stats:
 *   get:
 *     summary: Get notification statistics
 *     description: Retrieve notification statistics for a user
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "user-123"
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/NotificationStats'
 */
router.get("/:userId/stats", getNotificationStats);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 */
router.patch("/:id/read", markAsRead);

/**
 * @swagger
 * /notifications/{userId}/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     description: Mark all notifications for a user as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "user-123"
 *     responses:
 *       200:
 *         description: All notifications marked as read
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
 *                       example: "All notifications marked as read"
 *                     count:
 *                       type: integer
 *                       example: 5
 */
router.patch("/:userId/read-all", markAllAsRead);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     description: Delete a specific notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Notification deleted successfully
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
 *                       example: "Notification deleted successfully"
 */
router.delete("/:id", deleteNotification);

module.exports = router;
