const mongoose = require("mongoose");
const env = require("./env");

const connectDatabase = async () => {
  try {
    await mongoose.connect(env.mongoUri, {
      dbName: env.mongoDbName,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;