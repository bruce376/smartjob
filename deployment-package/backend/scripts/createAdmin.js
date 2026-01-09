const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
require("dotenv").config();

const createAdminAccount = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Admin account details
    const adminData = {
      name: "Admin",
      email: "admin@smartjob.com",
      password: "admin123456", // Change this to a secure password
      role: "Admin"
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log("⚠️  Admin account already exists!");
      console.log("Email:", adminData.email);
      
      // Ask if user wants to reset password
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('Do you want to reset the password? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
          const salt = await bcrypt.genSalt(10);
          existingAdmin.password = await bcrypt.hash(adminData.password, salt);
          await existingAdmin.save();
          console.log("✓ Admin password reset successfully!");
          console.log("\n=== Admin Account Details ===");
          console.log("Email:", adminData.email);
          console.log("Password:", adminData.password);
          console.log("Role: Admin");
          console.log("\n⚠️  IMPORTANT: Change this password after first login!");
        }
        readline.close();
        mongoose.connection.close();
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    // Create admin user
    const admin = await User.create(adminData);

    console.log("\n✓ Admin account created successfully!");
    console.log("\n=== Admin Account Details ===");
    console.log("Name:", admin.name);
    console.log("Email:", admin.email);
    console.log("Password: admin123456");
    console.log("Role:", admin.role);
    console.log("\n⚠️  IMPORTANT: Change this password after first login!");
    console.log("\n=== Login Instructions ===");
    console.log("1. Go to http://localhost:5174/login");
    console.log("2. Enter email: admin@smartjob.com");
    console.log("3. Enter password: admin123456");
    console.log("4. You will be redirected to the admin dashboard");

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error creating admin account:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

createAdminAccount();
