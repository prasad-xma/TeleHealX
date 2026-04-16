const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");
const notFoundMiddleware = require("./middlewares/notFound.middleware");
const webhookRoutes = require("./routes/webhook.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

/**
 * Stripe webhook must be mounted before JSON parsing.
 * This route uses express.raw in the route file.
 */
app.use("/api/webhooks", webhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;