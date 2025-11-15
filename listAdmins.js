const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./backend/models/user');

async function listAdminUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB...');

    // Find all admin users
    const admins = await User.find({ role: 'Admin' }).select('-password');
    
    console.log('\n=== Admin Users ===');
    if (admins.length === 0) {
      console.log('No admin users found.');
    } else {
      admins.forEach((admin, index) => {
        console.log(`\nAdmin #${index + 1}:`);
        console.log(`Name: ${admin.name}`);
        console.log(`Email: ${admin.email}`);
        console.log(`Role: ${admin.role}`);
        console.log(`Created: ${admin.createdAt}`);
      });
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the function
listAdminUsers();
