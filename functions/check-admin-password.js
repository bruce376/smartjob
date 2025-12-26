const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function checkAndFixAdmin() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('smartjob');
    const users = db.collection('users');
    
    // Find admin user
    const admin = await users.findOne({ email: 'admin@smartjob.com' });
    
    if (!admin) {
      console.log('❌ No admin user found');
      return;
    }

    console.log('\n🔍 Admin user found:');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Role: ${admin.role}`);
    console.log(`🔑 Password hash: ${admin.password ? 'Exists' : 'Missing'}`);
    
    // Test password
    const testPassword = 'Admin@1234';
    const isMatch = admin.password ? await bcrypt.compare(testPassword, admin.password) : false;
    
    if (isMatch) {
      console.log('✅ Password is correct');
    } else {
      console.log('❌ Password is incorrect or not hashed properly');
      
      // Update password
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      await users.updateOne(
        { _id: admin._id },
        { $set: { password: hashedPassword } }
      );
      
      console.log('\n✅ Admin password has been reset');
      console.log('📧 Email: admin@smartjob.com');
      console.log('🔑 New Password: Admin@1234');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkAndFixAdmin();
