// Test script to create test users and verify login functionality
const mongoose = require("mongoose");
const User = require("./models/user");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function createTestUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ Connected to MongoDB");

        // Test users to create
        const testUsers = [
            {
                name: "John Seeker",
                email: "jobseeker@test.com",
                password: "password123",
                role: "JobSeeker"
            },
            {
                name: "Jane Employer",
                email: "employer@test.com",
                password: "password123",
                role: "Employer"
            },
            {
                name: "Admin User",
                email: "admin@test.com",
                password: "password123",
                role: "Admin"
            }
        ];

        console.log("\n📝 Creating test users...\n");

        for (const userData of testUsers) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            
            if (existingUser) {
                console.log(`⚠️  User already exists: ${userData.email} (${userData.role})`);
            } else {
                // Hash password
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                
                // Create user
                const newUser = new User({
                    name: userData.name,
                    email: userData.email,
                    password: hashedPassword,
                    role: userData.role
                });
                
                await newUser.save();
                console.log(`✓ Created: ${userData.email} (${userData.role})`);
            }
        }

        // Display summary
        console.log("\n" + "=".repeat(60));
        console.log("📊 TEST ACCOUNTS READY");
        console.log("=".repeat(60));
        console.log("\n🔐 Login Credentials:\n");
        
        testUsers.forEach(user => {
            console.log(`${user.role}:`);
            console.log(`  Email:    ${user.email}`);
            console.log(`  Password: ${user.password}`);
            console.log("");
        });

        console.log("=".repeat(60));
        console.log("\n✅ You can now use these accounts to test login!");
        console.log("   Frontend: http://localhost:5173/login");
        console.log("   Backend:  http://localhost:5000/api/auth/login\n");

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.connection.close();
        console.log("✓ Database connection closed\n");
        process.exit(0);
    }
}

// Run the function
createTestUsers();
