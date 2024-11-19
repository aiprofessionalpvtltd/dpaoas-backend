// services/casesNotificationService.js

const db = require('../../models');
const CasesNotification = db.casesNotification;

const createNotification = async (notificationData) => {
  return await CasesNotification.create(notificationData);
};

const getNotificationById = async (notificationId) => {
  return await CasesNotification.findOne({ where: { notificationId } });
};

const updateNotification = async (notificationId, updateData) => {
  const [affectedRows, updatedRecords] = await CasesNotification.update(updateData, {
    where: { notificationId },
    returning: true, // To get the updated record (if supported by the DB)
  });
  return affectedRows > 0 ? updatedRecords[0] : null;
};


const getNotificationsByUserId = async (userId) => {
  return await CasesNotification.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']], // Optional ordering
  });
};

const deleteNotification = async (notificationId) => {
  return await CasesNotification.destroy({
    where: { notificationId },
  });
};

module.exports = {
  createNotification,
  getNotificationById,
  updateNotification,
  getNotificationsByUserId,
  deleteNotification,
};