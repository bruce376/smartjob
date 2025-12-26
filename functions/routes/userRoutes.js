const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// @route   GET /auth/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, userController.getCurrentUser);

// @route   PUT /auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', auth, userController.updateProfile);

// @route   PUT /auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, userController.changePassword);

module.exports = router;
