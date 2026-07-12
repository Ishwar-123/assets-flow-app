const Notification = require('../models/Notification');

const createNotification = async ({ recipient, type, message, relatedEntity, relatedEntityType }) => {
  try {
    if (!recipient) return null;
    return await Notification.create({
      recipient, type, message, relatedEntity, relatedEntityType
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

module.exports = { createNotification };
