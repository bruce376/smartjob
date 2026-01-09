const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email: 'remy@gmail.com' });
    if (user) {
      console.log('User found:', {
        email: user.email,
        role: user.role,
        name: user.name
      });
    } else {
      console.log('User not found: remy@gmail.com');
    }
    
    // Check all users
    const allUsers = await User.find({});
    console.log('\nAll users in database:');
    allUsers.forEach(u => {
      console.log(`- ${u.email} (${u.role})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUser();
