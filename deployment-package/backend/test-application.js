const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testApplication() {
    try {
        console.log('=== Testing Job Application Flow ===\n');
        
        // Step 1: Login as JobSeeker
        console.log('1. Logging in as JobSeeker...');
        const loginRes = await axios.post(`${API_BASE}/auth/login`, {
            email: 'jobseeker@test.com',
            password: 'password123',
            role: 'JobSeeker'
        });
        
        const token = loginRes.data.token;
        const user = loginRes.data.user;
        console.log(`✓ Logged in as: ${user.name} (${user.role})`);
        console.log(`✓ Token: ${token.substring(0, 30)}...\n`);
        
        // Step 2: Get jobs
        console.log('2. Fetching available jobs...');
        const jobsRes = await axios.get(`${API_BASE}/jobs`);
        const jobs = jobsRes.data.items || jobsRes.data.jobs || jobsRes.data;
        console.log(`✓ Found ${jobs.length} jobs`);
        
        if (jobs.length === 0) {
            console.log('❌ No jobs available to test application');
            return;
        }
        
        const testJob = jobs[0];
        console.log(`✓ Test job: ${testJob.title} (ID: ${testJob._id})\n`);
        
        // Step 3: Get user profile/CV data
        console.log('3. Fetching user profile...');
        const profileRes = await axios.get(`${API_BASE}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const cvData = profileRes.data.success ? profileRes.data.user : {};
        console.log(`✓ Profile fetched for: ${cvData.name || 'Unknown'}`);
        console.log(`  - Email: ${cvData.email || 'N/A'}`);
        console.log(`  - Phone: ${cvData.phone || 'N/A'}`);
        console.log(`  - Skills: ${cvData.skills?.length || 0}\n`);
        
        // Step 4: Apply for job
        console.log('4. Applying for job...');
        const applicationData = {
            coverLetter: 'This is a test application cover letter.',
            cvData: {
                phone: cvData.phone || '',
                location: cvData.location || '',
                bio: cvData.bio || '',
                skills: cvData.skills || [],
                experience: cvData.experience || [],
                education: cvData.education || [],
                certifications: cvData.certifications || [],
                languages: cvData.languages || [],
                linkedin: cvData.linkedin || '',
                github: cvData.github || '',
                portfolio: cvData.portfolio || '',
                resume: cvData.resume || ''
            }
        };
        
        const applyRes = await axios.post(
            `${API_BASE}/applications/${testJob._id}`,
            applicationData,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        
        console.log('✓ Application submitted successfully!');
        console.log(`  - Application ID: ${applyRes.data.application._id}`);
        console.log(`  - Status: ${applyRes.data.application.status}\n`);
        
        // Step 5: Verify application
        console.log('5. Fetching user applications...');
        const myAppsRes = await axios.get(`${API_BASE}/applications/my`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✓ Found ${myAppsRes.data.length} application(s)`);
        myAppsRes.data.forEach((app, i) => {
            console.log(`  ${i + 1}. ${app.job?.title || 'Unknown Job'} - Status: ${app.status}`);
        });
        
        console.log('\n=== All Tests Passed! ===');
        
    } catch (error) {
        console.error('\n❌ Error:', error.response?.data?.message || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testApplication();
