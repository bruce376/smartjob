const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// POST: Google Sign-In
router.post("/google", async (req, res) => {
    try {
        const { credential, role } = req.body;

        if (!credential) {
            return res.status(400).json({ message: "Google credential is required" });
        }

        // Decode Google JWT token (basic decode - in production, verify with Google)
        const base64Url = credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const googleUser = JSON.parse(jsonPayload);

        // Extract user info from Google token
        const { email, name, picture, sub: googleId } = googleUser;

        if (!email) {
            return res.status(400).json({ message: "Email not provided by Google" });
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            // User exists - login
            // Update Google ID if not set
            if (!user.googleId) {
                user.googleId = googleId;
                user.profilePicture = picture;
                await user.save();
            }

            // Generate JWT token without expiration
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

            return res.json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture
                }
            });
        } else {
            // New user - create account
            if (!role || !["JobSeeker", "Employer"].includes(role)) {
                return res.status(400).json({ 
                    message: "Role is required for new users",
                    needsRole: true 
                });
            }

            // Create new user
            const newUser = new User({
                name,
                email,
                googleId,
                profilePicture: picture,
                role,
                password: "google-oauth-" + Math.random().toString(36), // Random password (not used)
            });

            await newUser.save();

            // Generate JWT token
            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

            return res.status(201).json({
                token,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    profilePicture: newUser.profilePicture
                }
            });
        }
    } catch (err) {
        console.error("Google auth error:", err);
        res.status(500).json({ message: "Google authentication failed", error: err.message });
    }
});

// POST: Check if email exists (for role selection)
router.post("/google/check-email", async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.json({ 
                exists: true, 
                role: user.role,
                name: user.name 
            });
        } else {
            return res.json({ 
                exists: false,
                needsRole: true 
            });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
