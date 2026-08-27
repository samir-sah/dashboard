const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");

const errorHandler = require("./src/middlewares/error.middleware");

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Razorpay-Signature"],
  optionsSuccessStatus: 204,
};

app.use(helmet());
app.use(cors(corsOptions));

const paymentsWebhookRouter = require("./src/modules/client/payments/client.payments.webhook.routes");
app.use("/api/payments/webhook", paymentsWebhookRouter);

app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "1mb" }));
app.use(express.urlencoded({ extended: true, limit: process.env.URLENCODED_BODY_LIMIT || "1mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API is working");
});

const apiRouter = require("./src/routes/index");
app.use("/api", apiRouter);

app.use(errorHandler);

module.exports = app;
