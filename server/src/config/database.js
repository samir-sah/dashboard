const mongoose = require("mongoose");
const dotenv = require("dotenv");
const logger = require("../utils/logger");

if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  dotenv.config();
}

let cachedConnection = null;
let cachedConnectionPromise = null;

const connectToDatabase = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is required");
  }

  if (!cachedConnectionPromise) {
    cachedConnectionPromise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000),
      })
      .then((connection) => {
        cachedConnection = connection;
        logger.info("MongoDB connection established");
        return cachedConnection;
      })
      .catch((err) => {
        cachedConnectionPromise = null;
        logger.error({ err }, "MongoDB connection failed");
        throw err;
      });
  }

  cachedConnection = await cachedConnectionPromise;
  return cachedConnection;
};

const disconnectFromDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  cachedConnection = null;
  cachedConnectionPromise = null;
};

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
  mongoose,
};
