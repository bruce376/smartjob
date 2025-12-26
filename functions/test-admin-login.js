const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000';

async function testAdminLogin() {
  try {
    console.log('🔍 Testing admin login...');
    
    // Test with correct credentials
    console.log('\n✅ Testing with correct credentials:');
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: 'admin@smartjob.com',
        password: 'admin123456',
        role: 'Admin'
      });
      
      console.log('✅ Login successful!');
      console.log('User:', {
        id: response.data.user._id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role
      });
      console.log('Token:', response.data.token ? '✅ Present' : '❌ Missing');
      
    } catch (error) {
      if (error.response) {
        console.error('❌ Login failed:', {
          status: error.response.status,
          data: error.response.data
        });
      } else {
        console.error('❌ Error:', error.message);
      }
    }
    
    // Test with incorrect password
    console.log('\n❌ Testing with incorrect password:');
    try {
      await axios.post(`${API_URL}/api/auth/login`, {
        email: 'admin@smartjob.com',
        password: 'wrongpassword',
        role: 'Admin'
      });
    } catch (error) {
      console.log('✅ Expected error received:', error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the backend server is running');
    console.log('2. Check if the admin account exists in the database');
    console.log('3. Verify the JWT_SECRET in .env matches the one used to create tokens');
  }
}

testAdminLogin();
