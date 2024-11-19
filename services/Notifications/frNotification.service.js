// services/Notifications/frNotification.service.js

const db = require('../../models');
const FRNotification = db.frNotification;

const createNotification = async (notificationData) => {
  return await FRNotification.create(notificationData);
};

const getNotificationsByUserId = async (userId) => {
  return await FRNotification.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });
};

const deleteNotification = async (notificationId) => {
  return await FRNotification.destroy({
    where: { notificationId },
  });
};

module.exports = {
  createNotification,
  getNotificationsByUserId,
  deleteNotification,
};