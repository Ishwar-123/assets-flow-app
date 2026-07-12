const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ actor, action, details, entityType, entityId }) => {
  try {
    if (!actor) return null;
    return await ActivityLog.create({
      actor, action, details, entityType, entityId
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = { logActivity };
