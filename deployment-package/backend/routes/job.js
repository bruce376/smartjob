const express = require("express");
const router = express.Router();
const Job = require("../models/job");
const User = require("../models/user");
const auth = require("../middleware/authmiddleware");

// POST: Create a new job (Employer only)
router.post("/", auth, async (req, res) => {
    try {
        console.log('Received job creation request:', JSON.stringify(req.body, null, 2));
        
        const { 
            title, 
            description, 
            category, 
            location, 
            type, 
            salary, 
            requirements = [] 
        } = req.body;

        // Basic validation
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required',
                field: !title ? 'title' : 'description'
            });
        }

        const employer = await User.findById(req.user.id);
        if (!employer || employer.role !== "Employer") {
            return res.status(403).json({ 
                success: false,
                message: "Only employers can post jobs" 
            });
        }

        // Process requirements
        let cleanRequirements = [];
        
        if (Array.isArray(requirements)) {
            cleanRequirements = requirements
                .map(req => typeof req === 'string' ? req.trim() : String(req))
                .filter(req => req !== '');
        } else if (typeof requirements === 'string') {
            // Handle case where requirements is a single string
            cleanRequirements = [requirements.trim()].filter(req => req !== '');
        }
        
        console.log('Processed requirements:', cleanRequirements);

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
            type: (type && ["Full-Time", "Part-Time", "Remote", "Internship"].includes(type)) 
                ? type 
                : 'Full-Time',
            salary: salary ? salary.trim() : undefined,
            requirements: cleanRequirements,
            employer: employer._id,
        });

        console.log('Saving job with data:', {
            title: newJob.title,
            requirements: newJob.requirements,
            requirementsCount: newJob.requirements.length
        });

        await newJob.save();
        
        // Populate employer details in the response
        await newJob.populate('employer', 'name email');
        
        console.log('Job created successfully:', newJob._id);
        
        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            job: newJob
        });
    } catch (err) {
        console.error('Error creating job:', {
            error: err.message,
            stack: err.stack,
            requestBody: req.body
        });
        
        let errorMessage = 'Failed to create job';
        let statusCode = 500;
        
        if (err.name === 'ValidationError') {
            statusCode = 400;
            errorMessage = Object.values(err.errors).map(e => e.message).join(', ');
        }
        
        res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// GET: Fetch jobs belonging to the authenticated employer
router.get("/mine", auth, async (req, res) => {
    try {
        const employer = await User.findById(req.user.id);
        if (!employer || employer.role !== "Employer") {
            return res.status(403).json({ message: "Only employers can view their jobs" });
        }

        const jobs = await Job.find({ employer: employer._id })
            .sort({ createdAt: -1 })
            .populate("employer", "name email");

        res.json({ items: jobs });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET: Fetch jobs with search, filters, and pagination (Public)
router.get("/", async (req, res) => {
    try {
        const {
            q,
            category,
            location,
            type,
            page = 1,
            limit = 10
        } = req.query;

        const filters = {};
        if (q) {
            const rx = new RegExp(q, "i");
            filters.$or = [{ title: rx }, { description: rx }];
        }
        if (category) filters.category = category;
        if (location) filters.location = location;
        if (type) filters.type = type;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

        const [items, total] = await Promise.all([
            Job.find(filters)
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * pageSize)
                .limit(pageSize)
                .populate("employer", "name email"),
            Job.countDocuments(filters)
        ]);

        res.json({
            items,
            total,
            page: pageNum,
            limit: pageSize,
            pages: Math.ceil(total / pageSize)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET: Fetch single job by ID
router.get("/:id", async (req, res) => {
    try {
        console.log(`Fetching job with ID: ${req.params.id}`);
        const job = await Job.findById(req.params.id).populate("employer", "name email");
        
        if (!job) {
            console.log(`Job not found with ID: ${req.params.id}`);
            return res.status(404).json({ 
                success: false,
                message: "Job not found",
                error: "NOT_FOUND"
            });
        }
        
        console.log(`Successfully retrieved job: ${job.title} (${job._id})`);
        // Convert Mongoose document to plain object to include virtuals and getters
        const jobObject = job.toObject({ virtuals: true });
        
        // Ensure requirements is always an array
        if (!Array.isArray(jobObject.requirements)) {
            jobObject.requirements = [];
        }
        
        res.json({
            success: true,
            job: {
                _id: job._id,
                title: job.title,
                description: job.description,
                category: job.category,
                location: job.location,
                type: job.type,
                salary: job.salary,
                requirements: job.requirements || [],
                employer: job.employer,
                createdAt: job.createdAt,
                updatedAt: job.updatedAt
            }
        });
    } catch (err) {
        console.error(`Error fetching job ${req.params.id}:`, err);
        
        if (err.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid job ID format",
                error: "INVALID_ID"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching the job",
            error: err.message
        });
    }
});

// PUT: Update a job (Employer can ONLY update their own jobs)
router.put("/:id", auth, async (req, res) => {
    try {
        console.log('Received job update request for ID:', req.params.id);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('Authenticated user ID:', req.user.id);

        // Verify user is an employer
        const employer = await User.findById(req.user.id);
        if (!employer || employer.role !== "Employer") {
            console.log('Update rejected: User is not an employer');
            return res.status(403).json({ message: "Only employers can update jobs" });
        }

        const { 
            title, 
            description, 
            category, 
            location, 
            type, 
            salary, 
            requirements = [] 
        } = req.body;

        console.log('Updating job with data:', { 
            title, 
            category, 
            location, 
            type,
            requirements: requirements ? requirements.length : 0,
            hasRequirements: !!requirements 
        });

        const job = await Job.findById(req.params.id);

        // Check if job exists
        if (!job) {
            console.log('Job not found:', req.params.id);
            return res.status(404).json({ 
                success: false,
                message: "Job not found" 
            });
        }

        // Check if the employer owns the job
        if (job.employer.toString() !== req.user.id) {
            console.log('Unauthorized update attempt:', {
                jobOwner: job.employer,
                currentUser: req.user.id
            });
            return res.status(403).json({ 
                success: false,
                message: "Not authorized to update this job" 
            });
        }

        // Update job fields
        if (title !== undefined) job.title = title;
        if (description !== undefined) job.description = description;
        if (category !== undefined) job.category = category;
        if (location !== undefined) job.location = location;
        if (type !== undefined) job.type = type;
        if (salary !== undefined) job.salary = salary;
        
        // Handle requirements update
        if (requirements !== undefined) {
            // Ensure requirements is an array and clean it up
            const cleanRequirements = Array.isArray(requirements)
                ? requirements
                    .map(req => typeof req === 'string' ? req.trim() : String(req))
                    .filter(req => req !== '')
                : [];
            
            console.log('Updating requirements:', cleanRequirements);
            
            // Validate at least one requirement is provided
            if (cleanRequirements.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "At least one requirement is required",
                    field: 'requirements'
                });
            }
            
            job.requirements = cleanRequirements;
        }
        
        // Handle requirements update
        if (requirements !== undefined) {
            try {
                // Ensure requirements is an array and clean it up
                const cleanRequirements = Array.isArray(requirements) 
                    ? requirements
                        .map(req => typeof req === 'string' ? req.trim() : String(req))
                        .filter(req => req !== '')
                    : [];
                
                console.log('Updating requirements:', cleanRequirements);
                
                // Validate at least one requirement is provided
                if (cleanRequirements.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "At least one requirement is required"
                    });
                }
                
                // Use markModified to ensure Mongoose tracks the array changes
                job.markModified('requirements');
                job.requirements = cleanRequirements;
                
                // Force validation
                await job.validate();
                console.log('Requirements validation passed');
            } catch (validationError) {
                console.error('Requirements validation failed:', validationError);
                return res.status(400).json({
                    success: false,
                    message: `Invalid requirements: ${validationError.message}`,
                    error: process.env.NODE_ENV === 'development' ? validationError.message : undefined
                });
            }
        }

        console.log('Saving job with data:', {
            id: job._id,
            title: job.title,
            requirements: job.requirements,
            requirementsCount: job.requirements ? job.requirements.length : 0
        });

        const updatedJob = await job.save();
        console.log('✓ Job updated successfully:', updatedJob._id);
        
        res.json({
            success: true,
            message: 'Job updated successfully',
            job: updatedJob
        });
    } catch (err) {
        console.error('Error updating job:', {
            error: err.message,
            stack: err.stack,
            requestBody: req.body
        });
        res.status(500).json({ 
            success: false,
            message: "Error updating job",
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
});

// DELETE: Remove a job (Employer can ONLY delete their own jobs)
router.delete("/:id", auth, async (req, res) => {
    try {
        // Verify user is an employer
        const employer = await User.findById(req.user.id);
        if (!employer || employer.role !== "Employer") {
            return res.status(403).json({ message: "Only employers can delete jobs" });
        }

        // Find the job
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // CRITICAL: Verify the job belongs to THIS employer
        if (job.employer.toString() !== req.user.id) {
            console.log(`SECURITY: Employer ${employer.email} tried to delete job owned by another employer`);
            return res.status(403).json({ 
                message: "You can only delete jobs that you posted",
                error: "Not authorized to delete this job"
            });
        }

        // Store job info for logging
        const jobTitle = job.title;
        const jobId = job._id;

        // Delete the job
        await job.deleteOne();

        console.log(`✓ Employer ${employer.email} deleted job: "${jobTitle}" (ID: ${jobId})`);

        res.json({ 
            message: "Job deleted successfully",
            deletedJob: {
                id: jobId,
                title: jobTitle
            }
        });
    } catch (err) {
        console.error("Error deleting job:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
