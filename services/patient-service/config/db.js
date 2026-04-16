const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB);
        console.log("Patient Service: Connected with database...");
    } catch (error) {
        console.error(`Patient Service DB Error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;
