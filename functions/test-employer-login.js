// Quick test for employer login
const axios = require('axios');

async function testEmployerLogin() {
    try {
        console.log('Testing employer login...');

        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'employer@test.com',
            password: 'password123',
            role: 'Employer'
        });

        console.log('✅ Login successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.log('❌ Login failed!');
        if (error.response) {
            console.log('Error response:', error.response.status, error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

testEmployerLogin();
