const mongoose = require("mongoose");

const connectDB = () => {
  mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log("✅ MongoDB connected successfully!");
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
    });
};

module.exports = connectDB;
