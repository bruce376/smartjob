const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAdminEndpoints() {
    try {
        console.log('=== Testing Admin Endpoints ===\n');
        
        // Step 1: Login as Admin
        console.log('1. Logging in as Admin...');
        const loginRes = await axios.post(`${API_BASE}/auth/login`, {
            email: 'admin@smartjob.com',
            password: 'admin123456',
            role: 'Admin'
        });
        
        const token = loginRes.data.token;
        console.log(`✓ Logged in successfully`);
        console.log(`✓ Token: ${token.substring(0, 30)}...\n`);
        
        // Step 2: Test admin stats endpoint
        console.log('2. Testing /api/admin/stats...');
        try {
            const statsRes = await axios.get(`${API_BASE}/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✓ Stats endpoint working!');
            console.log('Stats:', JSON.stringify(statsRes.data.stats, null, 2));
            console.log(`Recent activities: ${statsRes.data.recentActivities?.length || 0}\n`);
        } catch (err) {
            console.error('❌ Stats endpoint failed:', err.response?.data || err.message);
        }
        
        // Step 3: Test users endpoint
        console.log('3. Testing /api/admin/users...');
        try {
            const usersRes = await axios.get(`${API_BASE}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page: 1, limit: 5 }
            });
            console.log('✓ Users endpoint working!');
            console.log(`Total users: ${usersRes.data.pagination.totalUsers}`);
            console.log(`Users fetched: ${usersRes.data.users.length}\n`);
        } catch (err) {
            console.error('❌ Users endpoint failed:', err.response?.data || err.message);
        }
        
        // Step 4: Test jobs endpoint
        console.log('4. Testing /api/admin/jobs...');
        try {
            const jobsRes = await axios.get(`${API_BASE}/admin/jobs`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page: 1, limit: 5 }
            });
            console.log('✓ Jobs endpoint working!');
            console.log(`Total jobs: ${jobsRes.data.pagination.totalJobs}`);
            console.log(`Jobs fetched: ${jobsRes.data.jobs.length}\n`);
        } catch (err) {
            console.error('❌ Jobs endpoint failed:', err.response?.data || err.message);
        }
        
        // Step 5: Test applications endpoint
        console.log('5. Testing /api/admin/applications...');
        try {
            const appsRes = await axios.get(`${API_BASE}/admin/applications`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page: 1, limit: 5 }
            });
            console.log('✓ Applications endpoint working!');
            console.log(`Total applications: ${appsRes.data.pagination.totalApplications}`);
            console.log(`Applications fetched: ${appsRes.data.applications.length}\n`);
        } catch (err) {
            console.error('❌ Applications endpoint failed:', err.response?.data || err.message);
        }
        
        // Step 6: Test activities endpoint
        console.log('6. Testing /api/admin/activities...');
        try {
            const activitiesRes = await axios.get(`${API_BASE}/admin/activities`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page: 1, limit: 10 }
            });
            console.log('✓ Activities endpoint working!');
            console.log(`Total activities: ${activitiesRes.data.pagination.totalActivities}`);
            console.log(`Activities fetched: ${activitiesRes.data.activities.length}\n`);
        } catch (err) {
            console.error('❌ Activities endpoint failed:', err.response?.data || err.message);
        }
        
        console.log('=== Test Complete ===');
        console.log('\nIf all endpoints are working, the admin dashboard should display data.');
        console.log('If you still see no data:');
        console.log('1. Check browser console (F12) for errors');
        console.log('2. Make sure you\'re logged in as admin');
        console.log('3. Try refreshing the page');
        console.log('4. Check Network tab to see API calls');
        
    } catch (error) {
        console.error('\n❌ Error:', error.response?.data?.message || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testAdminEndpoints();
