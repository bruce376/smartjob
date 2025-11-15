const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function checkAdmin() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('smartjob');
    const users = db.collection('users');
    
    // Check for admin user
    const admin = await users.findOne({ email: 'admin@smartjob.com' });
    
    if (!admin) {
      console.log('❌ No admin user found');
      console.log('\n🔄 Creating admin user...');
      
      // Create admin user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123456', 10);
      
      await users.insertOne({
        name: 'Admin',
        email: 'admin@smartjob.com',
        password: hashedPassword,
        role: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@smartjob.com');
      console.log('🔑 Password: admin123456');
    } else {
      console.log('✅ Admin user exists:');
      console.log(`📧 Email: ${admin.email}`);
      console.log(`👤 Role: ${admin.role}`);
      console.log(`🆔 ID: ${admin._id}`);
      
      // Check if password needs reset
      if (admin.password === 'admin123456' || !admin.password) {
        console.log('\n⚠️  Warning: Default password detected. Please change it immediately!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    process.exit(0);
  }
}

checkAdmin();
