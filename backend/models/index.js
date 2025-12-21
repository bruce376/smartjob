const mongoose = require('mongoose');

// Import all models
const User = require('./user');
const Job = require('./job');
const Application = require('./application');
const ActivityLog = require('./ActivityLog');

// Export all models
module.exports = {
  User,
  Job,
  Application,
  ActivityLog
};
