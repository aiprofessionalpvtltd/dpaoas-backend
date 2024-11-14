// controllers/casesNotificationController.js

const casesNotificationService = require('../../services/Notifications/casesNotification.service');

const createNotification = async (req, res) => {
  try {
    const { message, data, notificationId } = req.body; // Include userId
    const { userId } = req.params;

    // Step 1: Check if a notification with the given notificationId exists
    let existingNotification = await casesNotificationService.getNotificationById(notificationId);

    if (existingNotification) {
      // Step 2: Update the existing notification by appending new data
      const updatedDataArray = [...existingNotification.data, data]; // Append new data to existing array

      // Step 3: Update the notification in the database
      const updatedNotification = await casesNotificationService.updateNotification(notificationId, {
        data: updatedDataArray,
        message: message || existingNotification.message, // Optionally update the message if provided
        userId, // Include userId in the update
      });

      return res.status(200).json({
        success: true,
        message: 'Notification updated successfully',
        data: updatedNotification,
      });
    } else {
      // Step 4: Create a new notification if it doesn't exist
      const newNotification = await casesNotificationService.createNotification({
        notificationId, // This can be auto-generated if not provided
        message,
        data: [data], // Wrap data in an array since it's the first entry
        userId, // Include userId when creating a new notification
      });

      return res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: newNotification,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    // Retrieve notifications by userId
    const notifications = await casesNotificationService.getNotificationsByUserId(userId);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    // Delete the specified notification
    await casesNotificationService.deleteNotification(notificationId);

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  deleteNotification,
};