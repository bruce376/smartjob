const ActivityLog = require("../models/ActivityLog");

/**
 * Log user activity
 * @param {Object} params - Activity parameters
 * @param {String} params.userId - User ID
 * @param {String} params.action - Action type
 * @param {String} params.description - Activity description
 * @param {Object} params.req - Express request object (optional)
 * @param {Object} params.metadata - Additional metadata (optional)
 */
const logActivity = async ({ userId, action, description, req, metadata = {} }) => {
  try {
    const activityData = {
      user: userId,
      action,
      description,
      metadata
    };

    // Add IP and user agent if request object is provided
    if (req) {
      activityData.ipAddress = req.ip || req.connection.remoteAddress;
      activityData.userAgent = req.get('user-agent');
    }

    await ActivityLog.create(activityData);
  } catch (error) {
    // Log error but don't throw - activity logging shouldn't break the main flow
    console.error("Error logging activity:", error);
  }
};

module.exports = { logActivity };
