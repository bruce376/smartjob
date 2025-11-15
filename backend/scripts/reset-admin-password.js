require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const ADMIN_EMAIL = 'admin@smartjob.com';
const ADMIN_PASSWORD = 'Admin@1234';

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create admin user
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (!admin) {
      console.log('ℹ️  Admin user not found, creating a new one...');
      admin = new User({
        name: 'Admin',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        emailVerified: true
      });
    } else {
      console.log('🔑 Found existing admin user, updating password...');
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(ADMIN_PASSWORD, salt);
    
    // Save the admin user
    await admin.save();
    
    console.log('✅ Admin credentials have been reset successfully!');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    console.log('\n⚠️  Make sure to change this password after logging in!');
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

resetAdminPassword();
