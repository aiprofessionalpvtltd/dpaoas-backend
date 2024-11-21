// routes/frNotificationRoutes.js

const express = require('express');
const router = express.Router();
const frNotificationController = require('../../controllers/Notifications/frNotification.controller');

// Create an FR notification
router.post('/create/:userId', frNotificationController.createNotification);

// Get all FR notifications for a user
router.get('/getByUserId/:userId', frNotificationController.getNotifications);

// Delete a specific FR notification
router.delete('/deleteById/:notificationId', frNotificationController.deleteNotification);

module.exports = router;