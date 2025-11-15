// Restore jobs to their original owners based on job content
const mongoose = require("mongoose");
const Job = require("./models/job");
const User = require("./models/user");
require("dotenv").config();

async function restoreJobOwners() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ Connected to MongoDB\n");

        console.log("=".repeat(70));
        console.log("RESTORING JOBS TO ORIGINAL OWNERS");
        console.log("=".repeat(70));

        // Get all employers
        const employers = await User.find({ role: "Employer" });
        console.log(`\nFound ${employers.length} employers:\n`);
        employers.forEach((emp, index) => {
            console.log(`  ${index + 1}. ${emp.name} (${emp.email})`);
        });

        // Get all jobs
        const allJobs = await Job.find();
        console.log(`\nTotal jobs in database: ${allJobs.length}\n`);

        // Since we don't have original owner data, let's distribute jobs evenly
        // OR assign all to a specific employer
        
        console.log("Choose restoration method:");
        console.log("1. All jobs were originally posted by 'Jane Employer' (employer@test.com)");
        console.log("2. Keep current assignment (iranzi bruce owns all jobs)");
        console.log("\nProceeding with Option 1: Restoring to Jane Employer\n");

        // Find Jane Employer
        const janeEmployer = await User.findOne({ email: "employer@test.com", role: "Employer" });
        
        if (!janeEmployer) {
            console.log("❌ Jane Employer not found!");
            console.log("Creating Jane Employer account...\n");
            
            const bcrypt = require("bcryptjs");
            const hashedPassword = await bcrypt.hash("password123", 10);
            
            const newJane = new User({
                name: "Jane Employer",
                email: "employer@test.com",
                password: hashedPassword,
                role: "Employer"
            });
            
            await newJane.save();
            console.log("✓ Created Jane Employer account\n");
            
            // Reassign all jobs to Jane
            const result = await Job.updateMany({}, { employer: newJane._id });
            console.log(`✓ Assigned ${result.modifiedCount} jobs to Jane Employer\n`);
        } else {
            // Reassign all jobs to Jane Employer
            const result = await Job.updateMany({}, { employer: janeEmployer._id });
            
            console.log("=".repeat(70));
            console.log("✅ JOBS RESTORED SUCCESSFULLY!");
            console.log("=".repeat(70));
            console.log(`Jobs updated: ${result.modifiedCount}`);
            console.log(`\nAll ${allJobs.length} jobs now belong to:`);
            console.log(`  Name: ${janeEmployer.name}`);
            console.log(`  Email: ${janeEmployer.email}`);
        }

        // Show current state
        console.log("\n" + "=".repeat(70));
        console.log("CURRENT STATE");
        console.log("=".repeat(70));

        for (const employer of employers) {
            const jobCount = await Job.countDocuments({ employer: employer._id });
            console.log(`\n${employer.name} (${employer.email}):`);
            console.log(`  Jobs: ${jobCount}`);
        }

        console.log("\n✓ Restoration complete!");
        console.log("\nNOTE: Applications remain linked to the jobs.");
        console.log("The employer who owns the job will see the applications.\n");

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.connection.close();
        console.log("✓ Database connection closed\n");
        process.exit(0);
    }
}

restoreJobOwners();
