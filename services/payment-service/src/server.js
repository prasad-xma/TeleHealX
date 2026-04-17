const app = require("./app");
const env = require("./config/env");
const connectDatabase = require("./config/db");

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(env.port, () => {
      console.log(`${env.serviceName} running on port ${env.port}`);
      console.log(`Environment: ${env.nodeEnv}`);
    });

    process.on("unhandledRejection", (error) => {
      console.error(" Unhandled Rejection:", error.message);
      server.close(() => process.exit(1));
    });

    process.on("uncaughtException", (error) => {
      console.error(" Uncaught Exception:", error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error(" Failed to start payment-service:", error.message);
    process.exit(1);
  }
};

startServer();