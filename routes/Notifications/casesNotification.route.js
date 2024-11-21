// routes/casesNotificationRoutes.js

const express = require('express');
const router = express.Router();
const casesNotificationController = require('../../controllers/Notifications/casesNotification.controller');

// Create a notification
router.post('/create/:userId', casesNotificationController.createNotification);

// Get all notifications for a user
router.get('/getByUserId/:userId', casesNotificationController.getNotifications);

// Delete a specific notification
router.delete('/deleteById/:notificationId', casesNotificationController.deleteNotification);

module.exports = router;