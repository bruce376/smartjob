const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testEmployerFlow() {
    console.log('=== TESTING EMPLOYER FLOW ===\n');

    try {
        // 1. Test Login
        console.log('1. Testing Employer Login...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'employer@test.com',
            password: 'password123',
            role: 'Employer'
        });

        console.log('✅ Login successful');
        console.log('User:', loginResponse.data.user);
        const token = loginResponse.data.token;

        // 2. Test Fetch My Jobs
        console.log('\n2. Testing Fetch My Jobs...');
        const jobsResponse = await axios.get(`${API_BASE_URL}/jobs/mine`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Jobs fetched successfully');
        console.log(`Found ${jobsResponse.data.items.length} jobs`);

        // 3. Test Post New Job
        console.log('\n3. Testing Post New Job...');
        const newJob = {
            title: 'Test Job - ' + new Date().toISOString(),
            description: 'This is a test job posting to check if job creation works.',
            category: 'Technology',
            location: 'Remote',
            type: 'Full-Time',
            salary: '$50,000 - $70,000'
        };

        const postJobResponse = await axios.post(`${API_BASE_URL}/jobs`, newJob, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Job posted successfully');
        console.log('Job ID:', postJobResponse.data._id);

        // 4. Test Fetch Applications (might be empty)
        console.log('\n4. Testing Fetch Applications...');
        const appsResponse = await axios.get(`${API_BASE_URL}/applications/employer`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Applications fetched successfully');
        console.log(`Found ${appsResponse.data.length} applications`);

    } catch (error) {
        console.log('\n❌ ERROR OCCURRED:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
            console.log('Headers:', error.response.headers);
        } else if (error.request) {
            console.log('No response received:', error.message);
        } else {
            console.log('Request setup error:', error.message);
        }
    }
}

testEmployerFlow();
