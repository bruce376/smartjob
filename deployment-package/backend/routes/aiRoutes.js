const express = require('express');
const router = express.Router();
const jobMatchingService = require('../services/ai/jobMatchingService');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/ai/job-recommendations
 * @desc    Get job recommendations for the authenticated user
 * @access  Private
 */
router.get('/job-recommendations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    const recommendations = await jobMatchingService.getJobRecommendations(userId, limit);
    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting job recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
