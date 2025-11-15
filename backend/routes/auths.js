const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/authmiddleware");

// Input validation middleware
const validateRegisterInput = (req, res, next) => {
    const { name, email, password, confirmPassword, role } = req.body;
    
    // Check required fields
    if (!name || !email || !password || !confirmPassword || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check password match
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check password length
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Check valid role
    if (!['JobSeeker', 'Employer', 'Admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role specified" });
    }

    // Check valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please provide a valid email address" });
    }

    next();
};

// Register
router.post("/register", validateRegisterInput, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Prevent users from registering as Admin
        if (role === "Admin") {
            return res.status(403).json({ 
                success: false,
                message: "Admin accounts can only be created by existing administrators" 
            });
        }

        // Check if user exists (double check)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: "An account with this email already exists" 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            role
        });

        await newUser.save();

        // Generate JWT without expiration
        const token = jwt.sign(
            { userId: newUser._id }, 
            process.env.JWT_SECRET
            // No expiration time - token will never expire
        );

        // Return success response with user data (excluding password)
        const userObj = newUser.toObject();
        delete userObj.password;

        res.status(201).json({
            success: true,
            message: "Registration successful!",
            token,
            user: {
                id: userObj._id,
                name: userObj.name,
                email: userObj.email,
                role: userObj.role
            }
        });

    } catch (err) {
        console.error('Registration error:', err);
        
        // Handle validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        
        // Handle duplicate key error (email)
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error during registration. Please try again later.'
        });
    }
});

// Update user profile (CV data)
router.put("/profile", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

        // Remove sensitive fields that shouldn't be updated through this endpoint
        delete updateData.password;
        delete updateData.role;
        delete updateData.email;
        delete updateData.googleId;

        // Validate skills array
        if (updateData.skills && !Array.isArray(updateData.skills)) {
            return res.status(400).json({ message: "Skills must be an array" });
        }

        // Validate experience array structure
        if (updateData.experience) {
            if (!Array.isArray(updateData.experience)) {
                return res.status(400).json({ message: "Experience must be an array" });
            }
            for (let exp of updateData.experience) {
                if (!exp.title || !exp.company || !exp.startDate) {
                    return res.status(400).json({ message: "Experience entries must have title, company, and startDate" });
                }
            }
        }

        // Validate education array structure
        if (updateData.education) {
            if (!Array.isArray(updateData.education)) {
                return res.status(400).json({ message: "Education must be an array" });
            }
            for (let edu of updateData.education) {
                if (!edu.degree || !edu.institution) {
                    return res.status(400).json({ message: "Education entries must have degree and institution" });
                }
            }
        }

        // Validate certifications array structure
        if (updateData.certifications) {
            if (!Array.isArray(updateData.certifications)) {
                return res.status(400).json({ message: "Certifications must be an array" });
            }
            for (let cert of updateData.certifications) {
                if (!cert.name || !cert.issuer || !cert.issueDate) {
                    return res.status(400).json({ message: "Certification entries must have name, issuer, and issueDate" });
                }
            }
        }

        // Validate languages array structure
        if (updateData.languages) {
            if (!Array.isArray(updateData.languages)) {
                return res.status(400).json({ message: "Languages must be an array" });
            }
            for (let lang of updateData.languages) {
                if (!lang.language || !lang.proficiency) {
                    return res.status(400).json({ message: "Language entries must have language and proficiency" });
                }
                if (!['Beginner', 'Intermediate', 'Advanced', 'Native'].includes(lang.proficiency)) {
                    return res.status(400).json({ message: "Language proficiency must be Beginner, Intermediate, Advanced, or Native" });
                }
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (err) {
        console.error('Profile update error:', err);
        
        // Handle validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error during profile update. Please try again later.'
        });
    }
});

// Get user profile
router.get("/profile", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            success: true,
            user: user
        });
    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error fetching profile. Please try again later.'
        });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password, role } = req.body;
    console.log(`[LOGIN ATTEMPT] Email: ${email}, Role: ${role || 'not specified'}`);

    try {

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password'
            });
        }

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log(`[LOGIN ERROR] User not found: ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`[LOGIN ERROR] Invalid password for user: ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT
        // Check if the selected role matches the user's actual role
        if (role && user.role !== role) {
            console.log(`[LOGIN ERROR] Role mismatch - User ${user.email} has role ${user.role}, tried to login as ${role}`);
            return res.status(403).json({
                success: false,
                message: `This account is registered as a ${user.role}. Please select the correct account type to login.`
            });
        }

        // Generate JWT without expiration
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET
            // No expiration time - token will never expire
        );

        // Return user data (excluding password)
        const userObj = user.toObject();
        delete userObj.password;

        console.log(`[LOGIN SUCCESS] User ${user.email} (${user.role}) logged in successfully`);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: userObj._id,
                name: userObj.name,
                email: userObj.email,
                role: userObj.role
            }
        });

    } catch (err) {
        console.error('[LOGIN SERVER ERROR]', err);
        res.status(500).json({
            success: false,
            message: 'Server error during login. Please try again later.'
        });
    }
});

module.exports = router;
