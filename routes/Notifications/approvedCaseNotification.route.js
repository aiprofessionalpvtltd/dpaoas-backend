// routes/approvedCaseNotification.route.js

const express = require('express');
const router = express.Router();
const approvedCaseNotificationController = require('../../controllers/Notifications/approvedCaseNotification.controller');

// Create an approvedCase notification
router.post('/create/:userId', approvedCaseNotificationController.createNotification);

// Get all approvedCase notifications for a user
router.get('/getByUserId/:userId', approvedCaseNotificationController.getNotifications);

// Delete a specific approvedCase notification
router.delete('/deleteById/:notificationId', approvedCaseNotificationController.deleteNotification);

module.exports = router;