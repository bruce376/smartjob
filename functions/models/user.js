const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Name is required'],
      trim: true
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long']
    },
    role: { 
      type: String, 
      enum: {
        values: ["JobSeeker", "Employer", "Admin"],
        message: 'Role must be JobSeeker, Employer, or Admin'
      },
      default: "JobSeeker" 
    },
    googleId: { 
      type: String, 
      sparse: true 
    },
    profilePicture: { 
      type: String 
    },
    // CV/Profile fields for job seekers
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    bio: { type: String, maxlength: [500, 'Bio must be less than 500 characters'] },
    skills: [{ type: String, trim: true }],
    experience: [{
      title: { type: String, required: true },
      company: { type: String, required: true },
      location: { type: String },
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      current: { type: Boolean, default: false },
      description: { type: String }
    }],
    education: [{
      degree: { type: String, required: true },
      institution: { type: String, required: true },
      location: { type: String },
      graduationDate: { type: Date },
      gpa: { type: String },
      description: { type: String }
    }],
    certifications: [{
      name: { type: String, required: true },
      issuer: { type: String, required: true },
      issueDate: { type: Date, required: true },
      expiryDate: { type: Date },
      credentialId: { type: String },
      description: { type: String }
    }],
    languages: [{
      language: { type: String, required: true },
      proficiency: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Native'],
        required: true
      }
    }],
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    portfolio: { type: String, trim: true },
    resume: { type: String }, // URL to uploaded resume file
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password; // Never send password hash to client
        return ret;
      }
    }
  }
);

// Prevent model recompilation in case of hot-reloading
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
