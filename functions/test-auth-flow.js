const axios = require('axios');
const https = require('https');
require('dotenv').config();

const API_URL = 'http://localhost:5000';

// Create axios instance that doesn't reject on bad status
const api = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

async function testAuthFlow() {
  try {
    console.log('🔍 Testing authentication flow...');
    
    // Step 1: Test login
    console.log('\n🔑 Attempting login...');
    const loginResponse = await api.post(`${API_URL}/api/auth/login`, {
      email: 'admin@smartjob.com',
      password: 'Admin@1234',
      role: 'Admin'
    }, {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: status => status < 500 // Don't throw on 4xx errors
    });

    console.log('Login Response Status:', loginResponse.status);
    console.log('Response Headers:', JSON.stringify(loginResponse.headers, null, 2));
    
    if (loginResponse.data.token) {
      console.log('✅ Received JWT Token:', loginResponse.data.token.substring(0, 30) + '...');
    } else {
      console.log('❌ No token in response:', loginResponse.data);
      return;
    }

    // Step 2: Test accessing protected route
    console.log('\n🔒 Testing protected route...');
    const protectedResponse = await api.get(`${API_URL}/api/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`,
        'Content-Type': 'application/json'
      },
      validateStatus: status => status < 500
    });

    console.log('Protected Route Status:', protectedResponse.status);
    console.log('Response Data:', JSON.stringify(protectedResponse.data, null, 2));

    // Step 3: Check cookies
    console.log('\n🍪 Response Cookies:');
    const cookies = protectedResponse.headers['set-cookie'];
    if (cookies) {
      console.log('Cookies:', cookies);
    } else {
      console.log('No cookies set in response');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', error.response.headers);
    }
  }
}

testAuthFlow();
