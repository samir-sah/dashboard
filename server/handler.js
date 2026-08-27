const serverless = require("serverless-http");
const app = require("./app");
const { connectToDatabase } = require("./src/config/database");
const logger = require("./src/utils/logger");

const expressHandler = serverless(app, {
  request(request, event, context) {
    request.awsEvent = event;
    request.awsContext = context;
  },
});

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await connectToDatabase();
    return await expressHandler(event, context);
  } catch (err) {
    logger.error({ err }, "Lambda API handler failed");
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
    };
  }
};
