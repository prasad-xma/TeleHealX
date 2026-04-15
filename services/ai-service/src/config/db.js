import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB);
        console.log("Connected with db (ai-service)");
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}