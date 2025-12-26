const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String },
    location: { type: String },
    company: { type: String, trim: true },
    type: { type: String, enum: ["Full-Time", "Part-Time", "Remote", "Internship"], default: "Full-Time" },
    salary: { type: String },
    requirements: { 
      type: [String], 
      default: [],
      validate: {
        validator: function(v) {
          // If it's an array, ensure all items are non-empty strings
          if (!Array.isArray(v)) return false;
          return v.every(item => typeof item === 'string' && item.trim().length > 0);
        },
        message: props => `Requirements must be an array of non-empty strings`
      },
      set: function(requirements) {
        // Ensure we're working with an array and filter out empty strings
        if (!Array.isArray(requirements)) return [];
        return requirements
          .map(req => typeof req === 'string' ? req.trim() : String(req))
          .filter(req => req.length > 0);
      }
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft", "expired"],
      default: "active"
    },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.models.Job || mongoose.model("Job", JobSchema);
