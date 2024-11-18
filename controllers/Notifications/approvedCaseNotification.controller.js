// controllers/frNotificationController.js

const approvedCaseNotificationService = require('../../services/Notifications/approvedCaseNotification.service');

const createNotification = async (req, res) => {
  try {
    const { message, data, notificationId } = req.body;
    const { userId } = req.params;

    // Create a new notification
    const newNotification = await approvedCaseNotificationService.createNotification({
      notificationId,
      message,
      data: [data],
      userId,
    });

    return res.status(201).json({
      success: true,
      message: 'Approved Notification created successfully',
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
    const notifications = await approvedCaseNotificationService.getNotificationsByUserId(userId);

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
    await approvedCaseNotificationService.deleteNotification(notificationId);

    return res.status(200).json({
      success: true,
      message: 'Approved Notification deleted successfully',
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