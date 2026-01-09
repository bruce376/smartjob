// Reassign all jobs to the current employer
const mongoose = require("mongoose");
const Job = require("./models/job");
const User = require("./models/user");
require("dotenv").config();

async function reassignJobs() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ Connected to MongoDB\n");

        // Find the employer you want to assign jobs to
        const targetEmail = "ug2424887@ines.ac.rw"; // Your employer email
        const targetEmployer = await User.findOne({ email: targetEmail, role: "Employer" });

        if (!targetEmployer) {
            console.log(`❌ Employer with email ${targetEmail} not found!`);
            console.log("\nAvailable employers:");
            const employers = await User.find({ role: "Employer" });
            employers.forEach(emp => {
                console.log(`  - ${emp.name} (${emp.email})`);
            });
            process.exit(1);
        }

        console.log(`Target Employer: ${targetEmployer.name} (${targetEmployer.email})`);
        console.log(`Employer ID: ${targetEmployer._id}\n`);

        // Get all jobs
        const allJobs = await Job.find();
        console.log(`Total jobs in database: ${allJobs.length}\n`);

        // Update all jobs to belong to target employer
        const result = await Job.updateMany(
            {}, // Update all jobs
            { employer: targetEmployer._id }
        );

        console.log("=".repeat(60));
        console.log("✅ Jobs Reassigned Successfully!");
        console.log("=".repeat(60));
        console.log(`Jobs updated: ${result.modifiedCount}`);
        console.log(`\nAll ${allJobs.length} jobs now belong to:`);
        console.log(`  Name: ${targetEmployer.name}`);
        console.log(`  Email: ${targetEmployer.email}`);
        console.log("\n✓ You can now see applications in your dashboard!");

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.connection.close();
        console.log("\n✓ Database connection closed\n");
        process.exit(0);
    }
}

reassignJobs();
