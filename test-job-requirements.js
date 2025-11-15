const mongoose = require('mongoose');
require('dotenv').config();
const Job = require('./backend/models/job');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartjob', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testJobRequirements() {
  try {
    console.log('Testing job requirements...\n');
    
    // Create a test job with requirements
    const testJob = await Job.create({
      title: 'Test Job with Requirements',
      description: 'This is a test job to verify requirements saving',
      requirements: [
        'At least 3 years of experience',
        'Proficiency in JavaScript',
        'Team player'
      ],
      employer: new mongoose.Types.ObjectId() // Using a dummy ID for testing
    });

    console.log('✅ Test job created with requirements:', testJob.requirements);
    
    // Retrieve the job
    const savedJob = await Job.findById(testJob._id);
    console.log('\n🔍 Retrieved job requirements:', savedJob.requirements);
    
    // Verify the requirements were saved correctly
    const requirementsMatch = 
      savedJob.requirements.length === 3 &&
      savedJob.requirements.includes('At least 3 years of experience') &&
      savedJob.requirements.includes('Proficiency in JavaScript') &&
      savedJob.requirements.includes('Team player');
    
    if (requirementsMatch) {
      console.log('\n🎉 Requirements were saved and retrieved successfully!');
    } else {
      console.error('\n❌ Requirements do not match what was saved!');
    }
    
  } catch (error) {
    console.error('Error testing job requirements:', error);
  } finally {
    // Clean up: remove the test job
    if (testJob && testJob._id) {
      await Job.findByIdAndDelete(testJob._id);
      console.log('\n🧹 Cleaned up test job');
    }
    mongoose.connection.close();
  }
}

testJobRequirements();
