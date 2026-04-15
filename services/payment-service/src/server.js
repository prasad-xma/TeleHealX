const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.port, () => {
      console.log(`✅ ${env.serviceName} running on port ${env.port}`);
    });
  } catch (err) {
    console.error("❌ Payment service failed:", err.message);
    process.exit(1);
  }
};

startServer();