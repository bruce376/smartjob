import api from '../utils/api';

const aiService = {
  // Get AI-powered job recommendations
  getJobRecommendations: async () => {
    try {
      const response = await api.get('/ai/recommendations');
      return response.data;
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      throw error;
    }
  },

  // Extract skills from job description (placeholder for AI processing)
  extractSkills: async (jobDescription) => {
    // In a real implementation, this would call an AI service
    // For now, return a mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple keyword matching for demo purposes
        const commonSkills = [
          'JavaScript', 'React', 'Node.js', 'Python', 'Java',
          'Communication', 'Teamwork', 'Problem Solving'
        ];
        
        const foundSkills = commonSkills.filter(skill => 
          jobDescription.toLowerCase().includes(skill.toLowerCase())
        );
        
        // Ensure we return at least some skills
        if (foundSkills.length === 0) {
          foundSkills.push(...commonSkills.slice(0, 3));
        }
        
        resolve({
          success: true,
          skills: foundSkills
        });
      }, 1000);
    });
  },

  // Match job seeker with jobs (client-side filtering)
  matchJobs: (jobs, userProfile) => {
    return jobs.map(job => {
      let score = 0;
      const userSkills = userProfile.skills || [];
      const jobSkills = [...(job.requiredSkills || []), ...(job.preferredSkills || [])];
      
      // Calculate match score based on skills
      const skillMatches = userSkills.filter(skill => 
        jobSkills.some(js => 
          js.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(js.toLowerCase())
        )
      ).length;
      
      // Add to score based on skill matches
      score += (skillMatches / jobSkills.length) * 50;
      
      // Add to score based on job type match
      if (userProfile.preferredJobType && job.jobType === userProfile.preferredJobType) {
        score += 20;
      }
      
      // Add to score based on location match
      if (userProfile.preferredLocation && 
          job.location.toLowerCase().includes(userProfile.preferredLocation.toLowerCase())) {
        score += 30;
      }
      
      return {
        ...job,
        matchScore: Math.min(100, Math.round(score))
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }
};

export default aiService;
