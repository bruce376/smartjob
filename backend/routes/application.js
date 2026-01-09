const express = require("express");
const router = express.Router();
const auth = require("../middleware/authmiddleware");
const Application = require("../models/application");
const Job = require("../models/job");
const User = require("../models/user");

// POST: Apply for a job (JobSeeker only)
router.post("/:jobId", auth, async (req, res) => {
    try {
        const { coverLetter, cvData } = req.body;
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "JobSeeker")
            return res.status(403).json({ message: "Only Job Seekers can apply" });

        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });

        // Check if already applied
        const existing = await Application.findOne({ job: job._id, applicant: user._id });
        if (existing && existing.status !== "Rejected") {
            return res.status(400).json({ message: "You already applied for this job" });
        }

        // If there's a rejected application, delete it first
        if (existing && existing.status === "Rejected") {
            await Application.findByIdAndDelete(existing._id);
        }

        const newApp = new Application({
            job: job._id,
            applicant: user._id,
            coverLetter,
            cvData
        });

        await newApp.save();
        res.status(201).json({ message: "Application submitted successfully", application: newApp });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET: Job seeker’s applications
router.get("/my", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "JobSeeker")
            return res.status(403).json({ message: "Only Job Seekers can view this" });

        const apps = await Application.find({ applicant: req.user.id })
            .populate("job", "title location")
            .sort({ createdAt: -1 });

        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET: Employer can view all applications for their jobs ONLY
router.get("/employer", auth, async (req, res) => {
    try {
        const employer = await User.findById(req.user.id);
        if (!employer || employer.role !== "Employer")
            return res.status(403).json({ message: "Only employers can view applications" });

        // Find all jobs posted by THIS employer only
        const jobs = await Job.find({ employer: employer._id });
        const jobIds = jobs.map(j => j._id);

        console.log(`Employer ${employer.name} (${employer.email}) viewing applications`);
        console.log(`Jobs owned: ${jobs.length}`);

        // Find applications ONLY for jobs owned by this employer
        const applications = await Application.find({ job: { $in: jobIds } })
            .populate("job", "title location salary")
            .populate("applicant", "name email")
            .sort({ createdAt: -1 }); // Newest first

        // For each application, get the current CV data from the applicant's profile
        const applicationsWithCurrentCV = await Promise.all(
            applications.map(async (app) => {
                const applicantProfile = await User.findById(app.applicant._id);
                return {
                    ...app.toObject(),
                    currentCVData: {
                        phone: applicantProfile.phone || '',
                        location: applicantProfile.location || '',
                        bio: applicantProfile.bio || '',
                        skills: applicantProfile.skills || [],
                        experience: applicantProfile.experience || [],
                        education: applicantProfile.education || [],
                        certifications: applicantProfile.certifications || [],
                        languages: applicantProfile.languages || [],
                        linkedin: applicantProfile.linkedin || '',
                        github: applicantProfile.github || '',
                        portfolio: applicantProfile.portfolio || '',
                        resume: applicantProfile.resume || ''
                    }
                };
            })
        );

        console.log(`Applications found: ${applications.length}`);

        res.json(applicationsWithCurrentCV);
    } catch (err) {
        console.error("Error fetching employer applications:", err);
        res.status(500).json({ message: err.message });
    }
});

// GET: Employer can view applications for a specific job (ONLY their own jobs)
router.get("/job/:jobId", auth, async (req, res) => {
    try {
        const employer = await User.findById(req.user.id);
        if (!employer || employer.role !== "Employer")
            return res.status(403).json({ message: "Only employers can view applications" });

        // Verify the job belongs to this employer
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });

        if (job.employer.toString() !== req.user.id) {
            console.log(`SECURITY: Employer ${employer.email} tried to view applications for job they don't own`);
            return res.status(403).json({ message: "You can only view applications for your own jobs" });
        }

        // Get applications for this specific job
        const applications = await Application.find({ job: req.params.jobId })
            .populate("applicant", "name email profilePicture")
            .sort({ createdAt: -1 });

        console.log(`Employer ${employer.email} viewing ${applications.length} applications for job: ${job.title}`);

        res.json({
            job: {
                id: job._id,
                title: job.title,
                location: job.location,
                salary: job.salary
            },
            applications
        });
    } catch (err) {
        console.error("Error fetching job applications:", err);
        res.status(500).json({ message: err.message });
    }
});

// PUT: Employer updates application status (ONLY for their own jobs)
router.put("/:id/status", auth, async (req, res) => {
    try {
        const { status } = req.body;
        
        // Verify employer role
        const employer = await User.findById(req.user.id);
        if (!employer || employer.role !== "Employer")
            return res.status(403).json({ message: "Only employers can update application status" });

        const application = await Application.findById(req.params.id).populate("job");

        if (!application) return res.status(404).json({ message: "Application not found" });

        // CRITICAL: Verify that the job belongs to THIS employer
        if (application.job.employer.toString() !== req.user.id) {
            console.log(`SECURITY: Employer ${employer.email} tried to update application for job they don't own`);
            return res.status(403).json({ message: "You can only update applications for your own jobs" });
        }

        // Validate status
        const validStatuses = ["Pending", "Reviewed", "Accepted", "Rejected"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Prevent changing status if already rejected
        if (application.status === "Rejected") {
            return res.status(400).json({ message: "Cannot change status of a rejected application" });
        }

        // Prevent changing from accepted to rejected
        if (application.status === "Accepted" && status === "Rejected") {
            return res.status(400).json({ message: "Cannot reject an already accepted application" });
        }

        application.status = status;
        await application.save();

        console.log(`Employer ${employer.email} updated application ${application._id} to ${status}`);

        res.json({ message: "Status updated successfully", application });
    } catch (err) {
        console.error("Error updating application status:", err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE: Job seeker can delete their own application (ONLY before it's reviewed/accepted)
router.delete("/:id", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "JobSeeker")
            return res.status(403).json({ message: "Only Job Seekers can delete applications" });

        const application = await Application.findById(req.params.id);

        if (!application) return res.status(404).json({ message: "Application not found" });

        // Verify the application belongs to this job seeker
        if (application.applicant.toString() !== req.user.id) {
            console.log(`SECURITY: JobSeeker ${user.email} tried to delete application they don't own`);
            return res.status(403).json({ message: "You can only delete your own applications" });
        }

        // Prevent deletion if application is already accepted/rejected
        if (application.status === "Accepted" || application.status === "Rejected") {
            return res.status(400).json({ message: "Cannot delete an application that has already been reviewed" });
        }

        await Application.findByIdAndDelete(req.params.id);

        console.log(`JobSeeker ${user.email} deleted application ${application._id} for job: ${application.job?.title || 'Unknown'}`);

        res.json({ message: "Application deleted successfully" });
    } catch (err) {
        console.error("Error deleting application:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
