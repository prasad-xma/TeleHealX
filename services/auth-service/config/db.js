const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB);
        console.log("Connected with database...");


    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);

    }
}

module.exports = connectDB;