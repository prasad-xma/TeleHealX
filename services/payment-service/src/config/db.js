const mongoose = require("mongoose");
const env = require("./env");

const connectDatabase = async () => {
  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is missing in payment-service environment");
  }

  await mongoose.connect(env.mongoUri);
  console.log("✅ payment-service connected to MongoDB");
};

module.exports = connectDatabase;