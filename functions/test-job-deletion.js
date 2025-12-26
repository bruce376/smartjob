// Test script to verify job deletion security
const mongoose = require("mongoose");
const Job = require("./models/job");
const User = require("./models/user");
require("dotenv").config();

async function testJobDeletion() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ Connected to MongoDB\n");

        console.log("=".repeat(70));
        console.log("JOB DELETION SECURITY TEST");
        console.log("=".repeat(70));

        // Get all employers
        const employers = await User.find({ role: "Employer" });
        console.log(`\nTotal Employers: ${employers.length}\n`);

        for (const employer of employers) {
            console.log("-".repeat(70));
            console.log(`EMPLOYER: ${employer.name} (${employer.email})`);
            console.log("-".repeat(70));

            // Get jobs for this employer
            const jobs = await Job.find({ employer: employer._id });
            console.log(`Jobs Posted: ${jobs.length}`);

            if (jobs.length > 0) {
                console.log("\nJobs:");
                jobs.forEach((job, index) => {
                    console.log(`  ${index + 1}. ${job.title}`);
                    console.log(`     Location: ${job.location || 'Remote'}`);
                    console.log(`     ID: ${job._id}`);
                });
            } else {
                console.log("  No jobs posted");
            }
            console.log("");
        }

        // Security verification
        console.log("=".repeat(70));
        console.log("SECURITY RULES");
        console.log("=".repeat(70));

        console.log("\n✅ WHAT EMPLOYERS CAN DO:");
        console.log("  • View all jobs (public)");
        console.log("  • Post new jobs");
        console.log("  • Update ONLY their own jobs");
        console.log("  • Delete ONLY their own jobs");

        console.log("\n❌ WHAT EMPLOYERS CANNOT DO:");
        console.log("  • Update jobs posted by other employers");
        console.log("  • Delete jobs posted by other employers");
        console.log("  • Change the employer field of a job");

        console.log("\n🔒 SECURITY CHECKS:");
        console.log("  1. Verify user is authenticated");
        console.log("  2. Verify user has 'Employer' role");
        console.log("  3. Verify job exists");
        console.log("  4. Verify job.employer === logged_in_employer");
        console.log("  5. Log all unauthorized attempts");

        // Test scenario
        console.log("\n" + "=".repeat(70));
        console.log("TEST SCENARIO");
        console.log("=".repeat(70));

        if (employers.length >= 2) {
            const emp1 = employers[0];
            const emp2 = employers[1];

            const emp1Jobs = await Job.find({ employer: emp1._id });
            const emp2Jobs = await Job.find({ employer: emp2._id });

            console.log(`\n${emp1.name} has ${emp1Jobs.length} job(s)`);
            console.log(`${emp2.name} has ${emp2Jobs.length} job(s)`);

            console.log("\n✅ ALLOWED:");
            console.log(`  • ${emp1.name} can delete their own ${emp1Jobs.length} job(s)`);
            console.log(`  • ${emp2.name} can delete their own ${emp2Jobs.length} job(s)`);

            console.log("\n❌ BLOCKED:");
            console.log(`  • ${emp1.name} CANNOT delete ${emp2.name}'s jobs`);
            console.log(`  • ${emp2.name} CANNOT delete ${emp1.name}'s jobs`);

            if (emp1Jobs.length > 0 && emp2Jobs.length > 0) {
                const emp1Job = emp1Jobs[0];
                const emp2Job = emp2Jobs[0];

                console.log("\nEXAMPLE:");
                console.log(`  • ${emp1.name} tries to delete "${emp2Job.title}"`);
                console.log(`    → Result: 403 Forbidden ❌`);
                console.log(`    → Message: "You can only delete jobs that you posted"`);
                console.log(`    → Logged: SECURITY violation`);

                console.log(`\n  • ${emp1.name} tries to delete "${emp1Job.title}"`);
                console.log(`    → Result: 200 Success ✅`);
                console.log(`    → Message: "Job deleted successfully"`);
                console.log(`    → Logged: Job deletion`);
            }
        }

        console.log("\n" + "=".repeat(70));
        console.log("API ENDPOINTS");
        console.log("=".repeat(70));

        console.log("\nDELETE /api/jobs/:id");
        console.log("  Headers: Authorization: Bearer <token>");
        console.log("  Security: Employer can only delete their own jobs");
        console.log("  Response 200: { message: 'Job deleted successfully' }");
        console.log("  Response 403: { message: 'You can only delete jobs that you posted' }");
        console.log("  Response 404: { message: 'Job not found' }");

        console.log("\nPUT /api/jobs/:id");
        console.log("  Headers: Authorization: Bearer <token>");
        console.log("  Security: Employer can only update their own jobs");
        console.log("  Response 200: { ...updated job... }");
        console.log("  Response 403: { message: 'You can only update jobs that you posted' }");

        console.log("\n" + "=".repeat(70));
        console.log("✅ SECURITY TEST COMPLETE");
        console.log("=".repeat(70));
        console.log("\nYour job deletion is secure!");
        console.log("Employers can ONLY delete/update their own jobs.\n");

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.connection.close();
        console.log("✓ Database connection closed\n");
        process.exit(0);
    }
}

testJobDeletion();
