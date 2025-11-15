const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const User = require("../models/user");
const Job = require("../models/Job");
const Application = require("../models/Application");
const ActivityLog = require("../models/ActivityLog");
const { isAdmin } = require("../middleware/adminMiddleware");
const bcrypt = require("bcryptjs");

// All routes require admin authentication
router.use(isAdmin);

// Helper function to create activity log
const createActivityLog = async (userId, action, description, metadata = {}) => {
  try {
    const activity = new ActivityLog({
      user: userId,
      action,
      description,
      ipAddress: metadata.ipAddress || '',
      userAgent: metadata.userAgent || '',
      metadata: metadata.metadata || {}
    });
    await activity.save();
  } catch (error) {
    console.error('Error creating activity log:', error);
  }
};

// ============= DASHBOARD STATS =============
router.get("/stats", async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalUsers,
      totalJobSeekers,
      totalEmployers,
      totalAdmins,
      totalJobs,
      totalApplications,
      newUsers,
      pendingApplications,
      activeJobs,
      recentActivities
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "JobSeeker" }),
      User.countDocuments({ role: "Employer" }),
      User.countDocuments({ role: "Admin" }),
      Job.countDocuments(),
      Application.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Application.countDocuments({ status: "pending" }),
      Job.countDocuments({ createdAt: { $gte: startDate } }),
      ActivityLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("user", "name email role")
    ]);

    // Generate simplified chart data (reduce database queries)
    const userGrowthLabels = [];
    const userGrowthData = [];
    const jobTrendsLabels = [];
    const jobTrendsData = [];

    // Generate labels (dates) for the chart
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      userGrowthLabels.push(label);
      jobTrendsLabels.push(label);
      userGrowthData.push(0); // Placeholder, will be filled with actual data if available
      jobTrendsData.push(0); // Placeholder, will be filled with actual data if available
    }

    // For now, provide basic data structure - can be enhanced later with proper aggregation
    res.json({
      success: true,
      totalUsers,
      newUsers,
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      recentActivities,
      userGrowth: {
        labels: userGrowthLabels,
        data: userGrowthData
      },
      jobTrends: {
        labels: jobTrendsLabels,
        data: jobTrendsData
      },
      // Keep detailed stats for backward compatibility
      stats: {
        totalUsers,
        totalJobSeekers,
        totalEmployers,
        totalAdmins,
        totalJobs,
        totalApplications,
        newUsersLast30Days: newUsers,
        newApplicationsLast30Days: await Application.countDocuments({ createdAt: { $gte: startDate } })
      }
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics"
    });
  }
});

// Get detailed job info
router.get('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'name email role')
      .lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const applicationCount = await Application.countDocuments({ job: job._id });

    res.json({
      success: true,
      job: {
        ...job,
        applicationCount
      }
    });
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job details'
    });
  }
});

// ============= JOBS =============
// Get all jobs with pagination and filtering
router.get("/jobs", async (req, res) => {
  try {
    console.log('Fetching jobs with query params:', req.query);
    const { page = 1, limit = 10, status = '', search = '', sortBy = 'createdAt', order = 'desc' } = req.query;
    
    // Build query
    const query = {};
    
    // Only add status to query if it's provided and not empty
    if (status && status !== 'all' && status.trim() !== '') {
      query.status = status.trim();
    }
    
    // Add search conditions if search term is provided
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { company: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    console.log('Executing query:', JSON.stringify(query, null, 2));
    
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Limit max 100 items per page
    const sortDirection = order === 'asc' ? 1 : -1;
    const sortField = ['title', 'company', 'createdAt'].includes(sortBy) ? sortBy : 'createdAt';
    
    const jobsAggregation = Job.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'employer',
          foreignField: '_id',
          as: 'employerDetails'
        }
      },
      { $unwind: { path: '$employerDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'job',
          as: 'applications'
        }
      },
      {
        $addFields: {
          applicationCount: { $size: '$applications' },
          employerName: '$employerDetails.name',
          employerEmail: '$employerDetails.email'
        }
      },
      {
        $project: {
          applications: 0,
          employerDetails: 0
        }
      },
      { $sort: { [sortField]: sortDirection } },
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum }
    ]);

    const [jobs, total] = await Promise.all([
      jobsAggregation,
      Job.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);
    
    console.log(`Found ${jobs.length} jobs out of ${total} total`);
    
    const jobsWithEmployer = jobs.map(job => ({
      ...job,
      employer: job.employerName ? {
        name: job.employerName,
        email: job.employerEmail
      } : undefined
    }));

    res.json({
      success: true,
      jobs: jobsWithEmployer,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalJobs: total,
        limit: limitNum
      }
    });
    
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching jobs",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============= APPLICATIONS =============
// Get all applications with pagination and filtering
router.get("/applications", async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all', search = '' } = req.query;
    
    // Build query
    const query = {};
    if (status !== 'all') query.status = status;
    
    // Search in job title or applicant name/email
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const jobs = await Job.find({
        title: { $regex: search, $options: 'i' }
      }).select('_id');
      
      query.$or = [
        { applicant: { $in: users.map(u => u._id) } },
        { job: { $in: jobs.map(j => j._id) } }
      ];
    }

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('applicant', 'name email')
        .populate('job', 'title company')
        .sort({ appliedAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Application.countDocuments(query)
    ]);

    res.json({
      success: true,
      applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalApplications: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ success: false, message: "Error fetching applications" });
  }
});

// ============= ACTIVITY LOGS =============
// Get all activity logs with pagination
router.get("/activities", async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, action } = req.query;
    
    const query = {};
    if (userId) query.user = userId;
    if (action) query.action = action;

    const [activities, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      ActivityLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalActivities: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ success: false, message: "Error fetching activity logs" });
  }
});

// ============= USER MANAGEMENT =============

// Get all users with pagination and filters
router.get("/users", async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};
    
    // Filter by role
    if (role && role !== 'all') {
      query.role = role;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching users" 
    });
  }
});

// Get single user details
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Get user's activities
    const activities = await ActivityLog.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    // Get user's jobs (if employer)
    let jobs = [];
    if (user.role === "Employer") {
      jobs = await Job.find({ postedBy: user._id });
    }

    // Get user's applications (if job seeker)
    let applications = [];
    if (user.role === "JobSeeker") {
      applications = await Application.find({ applicant: user._id })
        .populate('job', 'title company');
    }

    res.json({
      success: true,
      user,
      activities,
      jobs,
      applications
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching user details" 
    });
  }
});

// Update user
router.put("/users/:id", async (req, res) => {
  try {
    const { name, email, role, phone, location } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;

    await user.save();

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: 'profile_update',
      description: `Profile updated by admin ${req.user.name}`,
      metadata: { updatedBy: req.user._id, updatedFields: Object.keys(req.body) }
    });

    res.json({
      success: true,
      message: "User updated successfully",
      user
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ 
      success: false,
      message: "Error updating user" 
    });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false,
        message: "You cannot delete your own account" 
      });
    }

    // Delete user's jobs if employer
    if (user.role === "Employer") {
      await Job.deleteMany({ postedBy: user._id });
    }

    // Delete user's applications if job seeker
    if (user.role === "JobSeeker") {
      await Application.deleteMany({ applicant: user._id });
    }

    // Log activity before deletion
    await ActivityLog.create({
      user: user._id,
      action: 'account_deleted',
      description: `Account deleted by admin ${req.user.name}`,
      metadata: { deletedBy: req.user._id }
    });

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ 
      success: false,
      message: "Error deleting user" 
    });
  }
});

// Reset user password
router.post("/users/:id/reset-password", async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 6 characters long" 
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: 'password_change',
      description: `Password reset by admin ${req.user.name}`,
      metadata: { resetBy: req.user._id }
    });

    res.json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ 
      success: false,
      message: "Error resetting password" 
    });
  }
});

// ============= JOB MANAGEMENT =============

// Create new job (Admin only)
router.post("/jobs", async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      location, 
      type, 
      salary, 
      requirements = [],
      company 
    } = req.body;

    // Basic validation
    if (!title || !description || !company) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and company are required',
        field: !title ? 'title' : !description ? 'description' : 'company'
      });
    }

    // Process requirements
    let cleanRequirements = [];
    
    if (Array.isArray(requirements)) {
      cleanRequirements = requirements
        .map(req => typeof req === 'string' ? req.trim() : String(req))
        .filter(req => req !== '');
    } else if (typeof requirements === 'string') {
      cleanRequirements = [requirements.trim()].filter(req => req !== '');
    }
    
    if (cleanRequirements.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one requirement is required",
        field: 'requirements'
      });
    }

    const newJob = new Job({
      title: title.trim(),
      description: description.trim(),
      category: category ? category.trim() : undefined,
      location: location ? location.trim() : undefined,
      company: company.trim(),
      type: (type && ["Full-Time", "Part-Time", "Remote", "Internship"].includes(type)) 
        ? type 
        : 'Full-Time',
      salary: salary ? salary.trim() : undefined,
      requirements: cleanRequirements,
      employer: req.user._id, // Admin creates job on behalf of themselves
      status: 'active'
    });

    await newJob.save();
    
    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'job_create',
      description: `Job "${newJob.title}" created by admin ${req.user.name}`,
      metadata: { jobId: newJob._id, createdBy: req.user._id }
    });
    
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job: newJob
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ 
      success: false,
      message: "Error creating job" 
    });
  }
});

// Update job status
router.put('/jobs/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'inactive', 'draft', 'expired'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    job.status = status;
    await job.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'job_status_change',
      description: `Job "${job.title}" status changed to ${status} by admin ${req.user.name}`,
      metadata: { jobId: job._id, status }
    });

    res.json({
      success: true,
      message: 'Job status updated successfully',
      job
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job status'
    });
  }
});

// Delete job
router.delete("/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: "Job not found" 
      });
    }

    // Delete all applications for this job
    await Application.deleteMany({ job: job._id });

    // Log activity
    await ActivityLog.create({
      user: job.postedBy,
      action: 'job_delete',
      description: `Job "${job.title}" deleted by admin ${req.user.name}`,
      metadata: { deletedBy: req.user._id, jobId: job._id }
    });

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Job deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ 
      success: false,
      message: "Error deleting job" 
    });
  }
});

// ============= APPLICATION MANAGEMENT =============

// Get all applications
router.get("/applications", async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('applicant', 'name email')
        .populate('job', 'title company')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Application.countDocuments(query)
    ]);

    res.json({
      success: true,
      applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalApplications: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching applications" 
    });
  }
});

// ============= ACTIVITY LOGS =============

// Get all activity logs
router.get("/activities", async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;

    const query = {};
    
    if (action) {
      query.action = action;
    }

    if (userId) {
      query.user = userId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [activities, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ActivityLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalActivities: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching activity logs" 
    });
  }
});

module.exports = router;
