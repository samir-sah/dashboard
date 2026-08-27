const { connectToDatabase, mongoose } = require("./database");

connectToDatabase().catch(() => {
    process.exitCode = 1;
});

module.exports = mongoose;
