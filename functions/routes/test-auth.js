const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Test login endpoint
router.post('/test-login', async (req, res) => {
    console.log('\n🔍 Test login request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { email, password, role } = req.body;
    
    try {
        // Find user
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log('❌ User not found');
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        console.log('👤 User found:', {
            id: user._id,
            email: user.email,
            role: user.role,
            hasPassword: !!user.password
        });
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log('❌ Password does not match');
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Check role if specified
        if (role && user.role !== role) {
            console.log(`❌ Role mismatch: Expected ${role}, got ${user.role}`);
            return res.status(403).json({
                success: false,
                message: `This account is registered as a ${user.role}`
            });
        }
        
        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        console.log('✅ Login successful');
        
        // Return success response
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('❌ Error in test login:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
});

module.exports = router;
