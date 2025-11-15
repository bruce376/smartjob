const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testCVView() {
    try {
        console.log('=== Testing CV View Functionality ===\n');
        
        // Step 1: Login as JobSeeker
        console.log('1. Logging in as JobSeeker...');
        const loginRes = await axios.post(`${API_BASE}/auth/login`, {
            email: 'jobseeker@test.com',
            password: 'password123',
            role: 'JobSeeker'
        });
        
        const token = loginRes.data.token;
        console.log(`✓ Logged in successfully\n`);
        
        // Step 2: Get user profile to check CV
        console.log('2. Fetching user profile...');
        const profileRes = await axios.get(`${API_BASE}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const userData = profileRes.data.user;
        console.log(`✓ Profile fetched for: ${userData.name}`);
        
        if (userData.resume) {
            console.log(`✓ CV found: ${userData.resume}`);
            
            // Step 3: Test if CV is accessible
            const cvUrl = `http://localhost:5000${userData.resume}`;
            console.log(`\n3. Testing CV accessibility at: ${cvUrl}`);
            
            try {
                const cvRes = await axios.get(cvUrl, {
                    responseType: 'arraybuffer'
                });
                console.log(`✓ CV is accessible!`);
                console.log(`  - Status: ${cvRes.status}`);
                console.log(`  - Content-Type: ${cvRes.headers['content-type']}`);
                console.log(`  - Size: ${cvRes.data.length} bytes`);
            } catch (cvErr) {
                console.error(`❌ CV is NOT accessible: ${cvErr.message}`);
                console.error(`  - Status: ${cvErr.response?.status}`);
            }
        } else {
            console.log('❌ No CV uploaded for this user');
            console.log('\nTip: Upload a CV first using the CV Profile page');
        }
        
        console.log('\n=== Test Complete ===');
        
    } catch (error) {
        console.error('\n❌ Error:', error.response?.data?.message || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
        }
    }
}

testCVView();
