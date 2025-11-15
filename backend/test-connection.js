// Simple MongoDB connection test
const mongoose = require("mongoose");
require("dotenv").config();

console.log("🔍 Testing MongoDB Connection...\n");
console.log("Connection String:", process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@'));
console.log("Attempting to connect...\n");

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
})
.then(() => {
    console.log("✅ SUCCESS! MongoDB connected successfully!");
    console.log("\n📊 Connection Details:");
    console.log("   Database:", mongoose.connection.db.databaseName);
    console.log("   Host:", mongoose.connection.host);
    console.log("   Port:", mongoose.connection.port);
    console.log("\n✓ Your MongoDB connection is working!");
    console.log("✓ You can now run your backend server.");
    process.exit(0);
})
.catch((err) => {
    console.log("❌ CONNECTION FAILED!");
    console.log("\n🔴 Error:", err.message);
    console.log("\n💡 Common Solutions:\n");
    
    if (err.message.includes("IP") || err.message.includes("whitelist")) {
        console.log("   1. Go to MongoDB Atlas → Network Access");
        console.log("   2. Click 'Add IP Address'");
        console.log("   3. Select 'Allow Access from Anywhere' (0.0.0.0/0)");
        console.log("   4. Wait 1-2 minutes and try again");
    } else if (err.message.includes("authentication")) {
        console.log("   1. Check username/password in .env file");
        console.log("   2. Go to MongoDB Atlas → Database Access");
        console.log("   3. Verify user exists and password is correct");
    } else if (err.message.includes("ENOTFOUND") || err.message.includes("network")) {
        console.log("   1. Check your internet connection");
        console.log("   2. Verify cluster URL is correct");
        console.log("   3. Try pinging: cluster0.gjsshpg.mongodb.net");
    } else {
        console.log("   1. Check your .env file");
        console.log("   2. Verify MONGO_URI is correct");
        console.log("   3. Check MongoDB Atlas status");
    }
    
    console.log("\n📖 See MONGODB_FIX.md for detailed solutions");
    process.exit(1);
});
