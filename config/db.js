const mongoose = require("mongoose");

const connectDB = () => {
  console.log("🔗 Connecting to MongoDB...");
  return mongoose.connect(process.env.DB_URL);
};

module.exports = connectDB;
