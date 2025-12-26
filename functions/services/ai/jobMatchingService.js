const natural = require('natural');
const { WordTokenizer, TfIdf } = natural;
const { User, Job } = require('../../models/index');

class JobMatchingService {
  constructor() {
    this.tokenizer = new WordTokenizer();
    this.tfidf = new TfIdf();
  }

  /**
   * Calculate similarity score between two texts using TF-IDF
   */
  calculateSimilarity(text1, text2) {
    const tokens1 = this.tokenizer.tokenize(text1.toLowerCase());
    const tokens2 = this.tokenizer.tokenize(text2.toLowerCase());
    
    // Simple Jaccard similarity for demonstration
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Match jobs to a candidate based on skills and preferences
   */
  async matchJobsToCandidate(userId) {
    try {
      // Get user profile with skills and preferences
      const user = await User.findById(userId)
        .select('skills experience education jobPreferences')
        .lean();
      
      if (!user) {
        throw new Error('User not found');
      }

      // Get all active jobs
      const jobs = await Job.find({ status: 'active' })
        .select('title description requirements skills location employmentType')
        .lean();

      // Create user profile text for comparison
      const userProfile = [
        ...(user.skills || []),
        ...(user.experience?.map(exp => `${exp.title} ${exp.company} ${exp.description}`) || []),
        ...(user.education?.map(edu => `${edu.degree} ${edu.field} ${edu.institution}`) || []),
        user.jobPreferences?.jobTitles?.join(' ') || '',
        user.jobPreferences?.locations?.join(' ') || '',
        user.jobPreferences?.employmentTypes?.join(' ') || ''
      ].join(' ');

      // Calculate match scores for each job
      const jobsWithScores = jobs.map(job => {
        const jobText = [
          job.title,
          job.description,
          job.requirements,
          job.skills?.join(' ') || '',
          job.location,
          job.employmentType
        ].join(' ');

        const score = this.calculateSimilarity(userProfile, jobText);
        
        return {
          ...job,
          matchScore: Math.round(score * 100),
          matchDetails: {
            matchedSkills: this.getMatchedSkills(user.skills || [], job.skills || [])
          }
        };
      });

      // Sort by match score (highest first)
      return jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
      console.error('Error in job matching:', error);
      throw error;
    }
  }

  /**
   * Get matched skills between user and job
   */
  getMatchedSkills(userSkills, jobSkills) {
    const userSkillsSet = new Set(userSkills.map(skill => skill.toLowerCase()));
    return jobSkills.filter(skill => 
      userSkillsSet.has(skill.toLowerCase())
    );
  }

  /**
   * Get job recommendations for a user
   */
  async getJobRecommendations(userId, limit = 10) {
    try {
      const matchedJobs = await this.matchJobsToCandidate(userId);
      return matchedJobs.slice(0, limit);
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      throw error;
    }
  }
}

module.exports = new JobMatchingService();
