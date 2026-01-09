const crypto = require('crypto');
require('dotenv').config();

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000/api';

async function postJson(path, payload) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error(`Failed to parse JSON response for ${path}: ${err.message}`);
  }

  return { response, data };
}

async function run() {
  const timestamp = Date.now();
  const password = 'Password123!';

  const validPayload = {
    name: 'Modal Job Seeker',
    email: `jobseeker_modal_${timestamp}@example.com`,
    password,
    confirmPassword: password,
    role: 'JobSeeker'
  };

  console.log('🧪 Testing successful job seeker registration...');
  const { response: successResponse, data: successData } = await postJson('/auth/register', validPayload);

  if (!successResponse.ok || !successData?.success) {
    throw new Error(`Expected successful registration but received status ${successResponse.status}: ${JSON.stringify(successData)}`);
  }

  console.log('✅ Registration succeeded. User ID:', successData.user?.id || 'N/A');

  const invalidPayload = {
    name: 'Missing Confirm Password',
    email: `jobseeker_missing_${timestamp}@example.com`,
    password,
    role: 'JobSeeker'
  };

  console.log('\n🧪 Testing validation when confirmPassword is missing...');
  const { response: failResponse, data: failData } = await postJson('/auth/register', invalidPayload);

  if (failResponse.status !== 400) {
    throw new Error(`Expected 400 status for missing fields but received ${failResponse.status}: ${JSON.stringify(failData)}`);
  }

  if (!failData?.message?.toLowerCase().includes('required')) {
    throw new Error(`Expected "All fields are required" message but received: ${JSON.stringify(failData)}`);
  }

  console.log('✅ Validation error confirmed:', failData.message);

  console.log('\n🎉 Job seeker registration flow verified successfully.');
}

run().catch((err) => {
  console.error('\n❌ Test failed:', err.message);
  process.exitCode = 1;
});
