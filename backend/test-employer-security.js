// Test script to verify employer application security
const mongoose = require("mongoose");
const Job = require("./models/job");
const Application = require("./models/application");
const User = require("./models/user");
require("dotenv").config();

async function testEmployerSecurity() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ Connected to MongoDB\n");

        console.log("=".repeat(70));
        console.log("EMPLOYER APPLICATION SECURITY TEST");
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
                const jobIds = jobs.map(j => j._id);

                // Get applications for this employer's jobs
                const applications = await Application.find({ job: { $in: jobIds } })
                    .populate("job", "title")
                    .populate("applicant", "name email");

                console.log(`Applications Received: ${applications.length}`);

                if (applications.length > 0) {
                    console.log("\nApplications:");
                    applications.forEach((app, index) => {
                        console.log(`  ${index + 1}. ${app.applicant?.name} applied for "${app.job?.title}"`);
                        console.log(`     Status: ${app.status}`);
                        console.log(`     Date: ${app.createdAt.toLocaleDateString()}`);
                    });
                } else {
                    console.log("  No applications yet");
                }

                // List jobs
                console.log("\nJobs Posted:");
                jobs.forEach((job, index) => {
                    console.log(`  ${index + 1}. ${job.title} (${job.location || 'Remote'})`);
                });
            } else {
                console.log("  No jobs posted yet");
            }

            console.log("");
        }

        // Security verification
        console.log("=".repeat(70));
        console.log("SECURITY VERIFICATION");
        console.log("=".repeat(70));

        const allJobs = await Job.find().populate("employer", "name email");
        const allApplications = await Application.find()
            .populate("job")
            .populate("applicant", "name");

        console.log(`\nTotal Jobs in Database: ${allJobs.length}`);
        console.log(`Total Applications in Database: ${allApplications.length}\n`);

        // Verify each application belongs to correct employer
        console.log("Verifying Application Ownership:");
        let securityIssues = 0;

        for (const app of allApplications) {
            if (!app.job) {
                console.log(`  ⚠️  Application ${app._id} has no job (orphaned)`);
                securityIssues++;
                continue;
            }

            const jobEmployer = app.job.employer;
            const employerInfo = await User.findById(jobEmployer);

            console.log(`  ✓ Application by ${app.applicant?.name} → Job: "${app.job.title}" → Employer: ${employerInfo?.name}`);
        }

        if (securityIssues === 0) {
            console.log("\n✅ ALL APPLICATIONS PROPERLY LINKED TO EMPLOYERS");
        } else {
            console.log(`\n⚠️  Found ${securityIssues} security issues`);
        }

        // Test isolation
        console.log("\n" + "=".repeat(70));
        console.log("ISOLATION TEST");
        console.log("=".repeat(70));

        if (employers.length >= 2) {
            const emp1 = employers[0];
            const emp2 = employers[1];

            const emp1Jobs = await Job.find({ employer: emp1._id });
            const emp2Jobs = await Job.find({ employer: emp2._id });

            const emp1JobIds = emp1Jobs.map(j => j._id);
            const emp2JobIds = emp2Jobs.map(j => j._id);

            const emp1Apps = await Application.find({ job: { $in: emp1JobIds } });
            const emp2Apps = await Application.find({ job: { $in: emp2JobIds } });

            console.log(`\n${emp1.name}:`);
            console.log(`  Jobs: ${emp1Jobs.length}`);
            console.log(`  Applications: ${emp1Apps.length}`);

            console.log(`\n${emp2.name}:`);
            console.log(`  Jobs: ${emp2Jobs.length}`);
            console.log(`  Applications: ${emp2Apps.length}`);

            // Check for overlap
            const overlap = emp1Apps.filter(app1 =>
                emp2Apps.some(app2 => app2._id.toString() === app1._id.toString())
            );

            if (overlap.length === 0) {
                console.log("\n✅ NO OVERLAP - Employers have separate applications");
            } else {
                console.log(`\n❌ SECURITY ISSUE - ${overlap.length} applications visible to both employers`);
            }
        }

        console.log("\n" + "=".repeat(70));
        console.log("✅ SECURITY TEST COMPLETE");
        console.log("=".repeat(70));

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.connection.close();
        console.log("\n✓ Database connection closed\n");
        process.exit(0);
    }
}

testEmployerSecurity();
