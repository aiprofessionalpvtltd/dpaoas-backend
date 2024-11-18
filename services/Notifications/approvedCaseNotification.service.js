// services/Notifications/ApprovedCaseNotification.service.js

const db = require('../../models');
const ApprovedCaseNotification = db.approvedCaseNotification;

const createNotification = async (notificationData) => {
  return await ApprovedCaseNotification.create(notificationData);
};

const getNotificationsByUserId = async (userId) => {
  return await ApprovedCaseNotification.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });
};

const deleteNotification = async (notificationId) => {
  return await ApprovedCaseNotification.destroy({
    where: { notificationId },
  });
};

module.exports = {
  createNotification,
  getNotificationsByUserId,
  deleteNotification,
};