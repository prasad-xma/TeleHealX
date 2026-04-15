const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGODB) {
            throw new Error('MONGODB is not configured');
        }

        await mongoose.connect(process.env.MONGODB);
        console.log('Connected with db (ai-service)');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;