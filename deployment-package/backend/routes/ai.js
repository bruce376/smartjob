const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const User = require('../models/user');
const auth = require('../middleware/authmiddleware');

// AI-powered job recommendations for job seekers
router.get('/recommendations', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get user skills and preferences (simplified example)
        const userSkills = user.skills || [];
        const preferredLocation = user.preferredLocation;
        const preferredJobType = user.preferredJobType;

        // Base query for job recommendations
        let query = { status: 'active' };
        
        // If user has skills, add them to the query
        if (userSkills.length > 0) {
            query.$or = [
                { 'requiredSkills': { $in: userSkills } },
                { 'preferredSkills': { $in: userSkills } }
            ];
        }

        // Add location filter if preferred location exists
        if (preferredLocation) {
            query['location'] = { $regex: preferredLocation, $options: 'i' };
        }

        // Add job type filter if preferred job type exists
        if (preferredJobType) {
            query['jobType'] = preferredJobType;
        }

        // Find matching jobs
        const recommendedJobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .limit(10);

        // If no jobs found with skills, fall back to general recommendations
        if (recommendedJobs.length === 0) {
            const fallbackJobs = await Job.find({ status: 'active' })
                .sort({ createdAt: -1 })
                .limit(5);
            return res.json({ 
                success: true, 
                recommendations: fallbackJobs,
                message: 'Here are some popular job listings for you'
            });
        }

        res.json({ 
            success: true, 
            recommendations: recommendedJobs,
            message: 'Recommended jobs based on your profile'
        });

    } catch (error) {
        console.error('AI Recommendation Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error generating recommendations',
            error: error.message 
        });
    }
});

module.exports = router;
