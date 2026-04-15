const app = require("./app");
const env = require("./config/env");
const connectDatabase = require("./config/db");

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(env.port, () => {
      console.log(`✅ ${env.serviceName} running on port ${env.port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start appointment-service:", error.message);
    process.exit(1);
  }
};

startServer();