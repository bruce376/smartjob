const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';

async function testCVUpload() {
    try {
        console.log('=== Testing CV Upload Flow ===\n');
        
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
        
        // Step 2: Test upload endpoint accessibility
        console.log('2. Testing upload endpoint...');
        try {
            const testRes = await axios.get(`${API_BASE}/upload/test`);
            console.log(`✓ Upload endpoint accessible: ${testRes.data.message}\n`);
        } catch (err) {
            console.log(`❌ Upload endpoint not accessible: ${err.message}\n`);
        }
        
        // Step 3: Create a test file
        console.log('3. Creating test CV file...');
        const testFilePath = path.join(__dirname, 'test-cv.txt');
        fs.writeFileSync(testFilePath, 'This is a test CV file for testing upload functionality.');
        console.log(`✓ Test file created: ${testFilePath}\n`);
        
        // Step 4: Upload CV
        console.log('4. Uploading CV...');
        const formData = new FormData();
        formData.append('cv', fs.createReadStream(testFilePath), {
            filename: 'test-cv.pdf',
            contentType: 'application/pdf'
        });
        
        try {
            const uploadRes = await axios.post(
                `${API_BASE}/upload/cv`,
                formData,
                {
                    headers: {
                        ...formData.getHeaders(),
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            console.log('✓ CV uploaded successfully!');
            console.log(`  - File path: ${uploadRes.data.filePath}`);
            console.log(`  - Message: ${uploadRes.data.message}\n`);
        } catch (uploadErr) {
            console.error('❌ Upload failed:', uploadErr.response?.data || uploadErr.message);
            console.error('Status:', uploadErr.response?.status);
        }
        
        // Clean up test file
        fs.unlinkSync(testFilePath);
        console.log('✓ Test file cleaned up\n');
        
        console.log('=== Test Complete ===');
        
    } catch (error) {
        console.error('\n❌ Error:', error.response?.data?.message || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testCVUpload();
