const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coverLetter: { type: String },
    cvData: {
      phone: { type: String },
      location: { type: String },
      bio: { type: String },
      skills: [{ type: String }],
      experience: [{
        title: { type: String },
        company: { type: String },
        location: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        current: { type: Boolean },
        description: { type: String }
      }],
      education: [{
        degree: { type: String },
        institution: { type: String },
        location: { type: String },
        graduationDate: { type: Date },
        gpa: { type: String },
        description: { type: String }
      }],
      certifications: [{
        name: { type: String },
        issuer: { type: String },
        issueDate: { type: Date },
        expiryDate: { type: Date },
        credentialId: { type: String },
        description: { type: String }
      }],
      languages: [{
        language: { type: String },
        proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Native'] }
      }],
      linkedin: { type: String },
      github: { type: String },
      portfolio: { type: String },
      resume: { type: String }
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Application || mongoose.model("Application", ApplicationSchema);
