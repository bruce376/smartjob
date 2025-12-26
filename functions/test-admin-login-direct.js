const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
}

// Test admin login
async function testAdminLogin() {
  try {
    console.log('\n🔍 Testing admin login...');
    
    // Admin credentials
    const email = 'admin@smartjob.com';
    const password = 'Admin@1234';
    
    console.log(`\n🔑 Testing with credentials:`);
    console.log(`📧 Email: ${email}`);
    
    // Find user
    const User = require('./models/user');
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ Error: Admin user not found');
      return;
    }
    
    console.log('\n👤 User found in database:');
    console.log(`- ID: ${user._id}`);
    console.log(`- Name: ${user.name}`);
    console.log(`- Role: ${user.role}`);
    console.log(`- Password hash: ${user.password ? 'Exists' : 'Missing'}`);
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`\n🔑 Password check: ${isMatch ? '✅ Match' : '❌ No match'}`);
    
    if (!isMatch) {
      console.log('\n💡 The password you entered does not match the stored hash.');
      console.log('   Try resetting the admin password with the following command:');
      console.log('   node reset-admin-password.js');
      return;
    }
    
    // If we get here, password is correct
    console.log('\n✅ Admin login test successful!');
    console.log('   The credentials are correct in the database.');
    
    // Test JWT generation
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log('\n🔐 Test JWT Token:');
    console.log(token);
    
  } catch (error) {
    console.error('❌ Error testing admin login:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the test
(async () => {
  const connected = await connectDB();
  if (connected) {
    await testAdminLogin();
  }
})();
