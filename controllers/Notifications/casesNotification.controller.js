// controllers/casesNotificationController.js

const casesNotificationService = require('../../services/Notifications/casesNotification.service');

const createNotification = async (req, res) => {
  try {
    const { message, data, notificationId } = req.body; // Include userId
    const { userId } = req.params;

      console.log('====================================');
      console.log(message, data, notificationId);
      console.log('====================================');
      
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