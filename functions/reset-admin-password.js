const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function resetAdminPassword() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('smartjob');
    const users = db.collection('users');
    
    // New password
    const newPassword = 'Admin@1234';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update admin password
    const result = await users.updateOne(
      { email: 'admin@smartjob.com', role: 'Admin' },
      { $set: { password: hashedPassword } }
    );
    
    if (result.matchedCount === 0) {
      console.log('❌ No admin user found. Creating one...');
      
      // Create admin user if not exists
      await users.insertOne({
        name: 'Admin',
        email: 'admin@smartjob.com',
        password: hashedPassword,
        role: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Admin user created successfully!');
    } else {
      console.log('✅ Admin password updated successfully!');
    }
    
    console.log('\n🔑 New Admin Credentials:');
    console.log('📧 Email: admin@smartjob.com');
    console.log('🔑 New Password: ' + newPassword);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

resetAdminPassword();
