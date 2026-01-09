// Route to create test users through API
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// POST: Create test users
router.post("/", async (req, res) => {
    try {
        const testUsers = [
            {
                name: "John Seeker",
                email: "jobseeker@test.com",
                password: "password123",
                role: "JobSeeker"
            },
            {
                name: "Jane Employer",
                email: "employer@test.com",
                password: "password123",
                role: "Employer"
            },
            {
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                role: "Admin"
            }
        ];

        const results = [];

        for (const userData of testUsers) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            
            if (existingUser) {
                results.push({
                    email: userData.email,
                    role: userData.role,
                    status: "already_exists"
                });
            } else {
                // Hash password
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                
                // Create user
                const newUser = new User({
                    name: userData.name,
                    email: userData.email,
                    password: hashedPassword,
                    role: userData.role
                });
                
                await newUser.save();
                results.push({
                    email: userData.email,
                    role: userData.role,
                    status: "created"
                });
            }
        }

        res.status(201).json({
            success: true,
            message: "Test users processed",
            users: results,
            credentials: {
                jobseeker: { email: "jobseeker@test.com", password: "password123" },
                employer: { email: "employer@test.com", password: "password123" },
                admin: { email: "admin@test.com", password: "password123" }
            }
        });

    } catch (error) {
        console.error("Error creating test users:", error);
        res.status(500).json({ 
            success: false,
            message: "Error creating test users", 
            error: error.message 
        });
    }
});

// GET: List all users (for testing only - remove in production!)
router.get("/list", async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude passwords
        res.json({
            count: users.length,
            users: users.map(u => ({
                id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                createdAt: u.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
