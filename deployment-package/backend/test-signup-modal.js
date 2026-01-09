const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testSignupModal() {
    console.log('=== TESTING SIGNUP MODAL FUNCTIONALITY ===\n');

    try {
        // Test signup with employer role (like the modal would do)
        console.log('1. Testing Employer Signup...');
        const signupResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
            name: 'Test Employer Modal',
            email: 'modal-test-employer@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            role: 'Employer'
        });

        console.log('✅ Signup successful');
        console.log('User:', signupResponse.data.user);
        const token = signupResponse.data.token;

        // Test if token works for authenticated requests
        console.log('\n2. Testing Authenticated Request...');
        const jobsResponse = await axios.get(`${API_BASE_URL}/jobs/mine`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Authenticated request successful');
        console.log(`Jobs found: ${jobsResponse.data.items.length}`);

        // Test posting a job
        console.log('\n3. Testing Job Posting...');
        const newJob = {
            title: 'Test Job from Modal Signup',
            description: 'This job was posted after signup through the modal.',
            category: 'Technology',
            location: 'Remote',
            type: 'Full-Time',
            salary: '$60,000 - $80,000'
        };

        const postJobResponse = await axios.post(`${API_BASE_URL}/jobs`, newJob, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Job posted successfully');
        console.log('Job ID:', postJobResponse.data._id);

    } catch (error) {
        console.log('\n❌ SIGNUP MODAL TEST FAILED:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

testSignupModal();
