// Seed route to populate database with sample jobs
const express = require("express");
const router = express.Router();
const Job = require("../models/job");
const User = require("../models/user");
const sampleJobs = require("../jobs");
const bcrypt = require("bcryptjs");

// POST: Seed the database with sample jobs
router.post("/", async (req, res) => {
    try {
        // Find an employer user to assign jobs to
        let employer = await User.findOne({ role: "Employer" });
        
        if (!employer) {
            console.log("No employer found. Creating a default employer...");
            const hashedPassword = await bcrypt.hash("employer123", 10);
            
            employer = new User({
                name: "Tech Company HR",
                email: "employer@example.com",
                password: hashedPassword,
                role: "Employer"
            });
            await employer.save();
            console.log("Created default employer account");
        }

        // Clear existing jobs (optional)
        const deletedCount = await Job.deleteMany({});
        console.log(`Cleared ${deletedCount.deletedCount} existing jobs`);

        // Insert sample jobs
        const jobsWithEmployer = sampleJobs.map(job => ({
            ...job,
            employer: employer._id
        }));

        const insertedJobs = await Job.insertMany(jobsWithEmployer);
        
        res.status(201).json({
            success: true,
            message: "Database seeded successfully",
            jobsCreated: insertedJobs.length,
            employer: {
                name: employer.name,
                email: employer.email
            }
        });

    } catch (error) {
        console.error("Error seeding database:", error);
        res.status(500).json({ 
            success: false,
            message: "Error seeding database", 
            error: error.message 
        });
    }
});

// GET: Check if database has jobs
router.get("/status", async (req, res) => {
    try {
        const jobCount = await Job.countDocuments();
        const employerCount = await User.countDocuments({ role: "Employer" });
        
        res.json({
            jobCount,
            employerCount,
            needsSeeding: jobCount === 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
