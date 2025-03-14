// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const {
 createNotification,
 getUserNotifications,
 getPropertyNotifications,
 markAsRead,
 deleteNotification,
 getUnreadCount,
 bulkMarkAsRead,
} = require('../controllers/NotificationController');

// Create a new notification
router.post('/', createNotification);
// Get all notifications for a user
router.get('/user/:userId', getUserNotifications);
// Get all notifications for a property
router.get('/property/:propertyId', getPropertyNotifications);
// Mark a notification as read
router.put('/:id/read', markAsRead);
// Delete a notification
router.delete('/:id', deleteNotification);
// Get unread notifications count
router.get('/unread/:userId', getUnreadCount);
// Mark all notifications as read for a user
router.put('/user/:userId/read-all', bulkMarkAsRead);

module.exports = router;
