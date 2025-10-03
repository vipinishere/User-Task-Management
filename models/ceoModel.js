const mongoose = require("mongoose");

const ceoSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    trim: true,
    required: true,
  },
  role: {
    type: String,
    default: "ceo"
  }
});

module.exports = mongoose.model("CEO", ceoSchema);
