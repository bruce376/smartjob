const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function testConnection() {
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas');

    // List all databases
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    
    console.log('\n📊 Available databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name} (Size: ${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });

    // Check smartjob database collections
    const smartjobDb = client.db('smartjob');
    const collections = await smartjobDb.listCollections().toArray();
    
    console.log('\n📂 Collections in smartjob database:');
    if (collections.length === 0) {
      console.log('No collections found in smartjob database');
    } else {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify your MongoDB Atlas IP whitelist includes your current IP');
    console.log('3. Make sure your cluster is running in MongoDB Atlas');
    console.log('4. Verify your connection string in .env file');
  } finally {
    // Close the connection
    await client.close();
  }
}

testConnection();
