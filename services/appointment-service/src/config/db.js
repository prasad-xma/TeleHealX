const mongoose = require("mongoose");
const env = require("./env");

const connectDatabase = async () => {
  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is missing in appointment-service environment");
  }

  await mongoose.connect(env.mongoUri);
  console.log("✅ appointment-service connected to MongoDB");
};

module.exports = connectDatabase;