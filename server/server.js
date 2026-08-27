require("dotenv").config();
const app = require("./app");
const { connectToDatabase } = require("./src/config/database");
const logger = require('./src/utils/logger');

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception detected');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason }, 'Unhandled promise rejection detected');
});

// Port
const PORT = process.env.PORT || 4400;

connectToDatabase()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      logger.info({ port: PORT }, "Local server started");
    });
  })
  .catch((err) => {
    logger.fatal({ err }, "Failed to start local server");
    process.exit(1);
  });
