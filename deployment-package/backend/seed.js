// Seed script to populate the database with sample jobs
const mongoose = require("mongoose");
const Job = require("./models/job");
const User = require("./models/user");
const sampleJobs = require("./jobs");
require("dotenv").config();

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ Connected to MongoDB");

        // Find an employer user to assign jobs to
        let employer = await User.findOne({ role: "Employer" });
        
        if (!employer) {
            console.log("⚠ No employer found. Creating a default employer...");
            const bcrypt = require("bcryptjs");
            const hashedPassword = await bcrypt.hash("employer123", 10);
            
            employer = new User({
                name: "Tech Company HR",
                email: "employer@example.com",
                password: hashedPassword,
                role: "Employer"
            });
            await employer.save();
            console.log("✓ Created default employer account");
            console.log("  Email: employer@example.com");
            console.log("  Password: employer123");
        }

        // Clear existing jobs (optional - comment out if you want to keep existing jobs)
        const deletedCount = await Job.deleteMany({});
        console.log(`✓ Cleared ${deletedCount.deletedCount} existing jobs`);

        // Insert sample jobs
        const jobsWithEmployer = sampleJobs.map(job => ({
            ...job,
            employer: employer._id
        }));

        const insertedJobs = await Job.insertMany(jobsWithEmployer);
        console.log(`✓ Successfully inserted ${insertedJobs.length} sample jobs`);

        // Display summary
        console.log("\n📊 Database Seeding Summary:");
        console.log(`   Total Jobs: ${insertedJobs.length}`);
        console.log(`   Employer: ${employer.name} (${employer.email})`);
        console.log("\n✅ Database seeding completed successfully!");

    } catch (error) {
        console.error("❌ Error seeding database:", error.message);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log("\n✓ Database connection closed");
        process.exit(0);
    }
}

// Run the seed function
seedDatabase();
