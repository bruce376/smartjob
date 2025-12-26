// Test script to check applications in database
const mongoose = require("mongoose");
const Application = require("./models/application");
const Job = require("./models/job");
const User = require("./models/user");
require("dotenv").config();

async function checkApplications() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ Connected to MongoDB\n");

        // Get all applications
        const applications = await Application.find()
            .populate("job", "title")
            .populate("applicant", "name email role");

        console.log("=".repeat(60));
        console.log("📊 APPLICATIONS IN DATABASE");
        console.log("=".repeat(60));
        console.log(`Total Applications: ${applications.length}\n`);

        if (applications.length === 0) {
            console.log("⚠️  No applications found in database!");
            console.log("\nPossible reasons:");
            console.log("1. Job seekers haven't applied yet");
            console.log("2. Applications are being created but not saved");
            console.log("3. Wrong collection name\n");
        } else {
            applications.forEach((app, index) => {
                console.log(`Application #${index + 1}:`);
                console.log(`  Job: ${app.job?.title || 'Unknown'}`);
                console.log(`  Applicant: ${app.applicant?.name || 'Unknown'} (${app.applicant?.email})`);
                console.log(`  Role: ${app.applicant?.role}`);
                console.log(`  Status: ${app.status}`);
                console.log(`  Cover Letter: ${app.coverLetter ? 'Yes' : 'No'}`);
                console.log(`  Applied: ${app.createdAt}`);
                console.log("");
            });
        }

        // Get all employers
        console.log("=".repeat(60));
        console.log("👔 EMPLOYERS IN DATABASE");
        console.log("=".repeat(60));
        const employers = await User.find({ role: "Employer" });
        console.log(`Total Employers: ${employers.length}\n`);

        for (const employer of employers) {
            console.log(`Employer: ${employer.name} (${employer.email})`);
            
            // Get jobs for this employer
            const jobs = await Job.find({ employer: employer._id });
            console.log(`  Jobs Posted: ${jobs.length}`);
            
            if (jobs.length > 0) {
                const jobIds = jobs.map(j => j._id);
                const employerApps = await Application.find({ job: { $in: jobIds } })
                    .populate("applicant", "name email");
                
                console.log(`  Applications Received: ${employerApps.length}`);
                
                if (employerApps.length > 0) {
                    employerApps.forEach(app => {
                        console.log(`    - ${app.applicant?.name} applied (${app.status})`);
                    });
                }
            }
            console.log("");
        }

        // Get all job seekers
        console.log("=".repeat(60));
        console.log("👤 JOB SEEKERS IN DATABASE");
        console.log("=".repeat(60));
        const jobSeekers = await User.find({ role: "JobSeeker" });
        console.log(`Total Job Seekers: ${jobSeekers.length}\n`);

        for (const seeker of jobSeekers) {
            const seekerApps = await Application.find({ applicant: seeker._id })
                .populate("job", "title");
            console.log(`${seeker.name} (${seeker.email})`);
            console.log(`  Applications Submitted: ${seekerApps.length}`);
            
            if (seekerApps.length > 0) {
                seekerApps.forEach(app => {
                    console.log(`    - Applied for: ${app.job?.title}`);
                });
            }
            console.log("");
        }

        console.log("=".repeat(60));
        console.log("✅ Database check complete!");
        console.log("=".repeat(60));

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.connection.close();
        console.log("\n✓ Database connection closed\n");
        process.exit(0);
    }
}

checkApplications();
