const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'login',
        'logout',
        'register',
        'profile_update',
        'password_change',
        'job_post',
        'job_update',
        'job_delete',
        'job_apply',
        'application_update',
        'cv_upload',
        'cv_delete',
        'account_suspended',
        'account_activated',
        'account_deleted'
      ]
    },
    description: {
      type: String,
      required: true
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
ActivityLogSchema.index({ user: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });
ActivityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.models.ActivityLog || mongoose.model("ActivityLog", ActivityLogSchema);
