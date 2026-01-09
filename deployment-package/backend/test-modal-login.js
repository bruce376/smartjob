const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testModalLogin() {
    console.log('=== TESTING MODAL LOGIN ===\n');

    try {
        // Test modal login with employer role
        console.log('1. Testing Modal Login (Employer)...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'employer@test.com',
            password: 'password123',
            role: 'Employer'
        });

        console.log('✅ Modal login successful');
        console.log('User:', loginResponse.data.user);
        const token = loginResponse.data.token;

        // Test if token works for authenticated requests
        console.log('\n2. Testing Authenticated Request...');
        const jobsResponse = await axios.get(`${API_BASE_URL}/jobs/mine`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Authenticated request successful');
        console.log(`Jobs found: ${jobsResponse.data.items.length}`);

    } catch (error) {
        console.log('\n❌ MODAL LOGIN TEST FAILED:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

testModalLogin();
