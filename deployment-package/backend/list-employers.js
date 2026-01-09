const mongoose = require("mongoose");
const User = require("./models/user");
require("dotenv").config();

async function listEmployers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const employers = await User.find({ role: "Employer" }).select('name email role createdAt');
        console.log("Employers in database:");
        employers.forEach(emp => {
            console.log(`- ${emp.name} (${emp.email}) - Created: ${emp.createdAt}`);
        });

        console.log(`Total employers: ${employers.length}`);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        mongoose.connection.close();
    }
}

listEmployers();
