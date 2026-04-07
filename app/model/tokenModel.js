const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  token: {
    type: String,
  },
  rememberMe: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60 //30 days in sec
  }
});

module.exports = mongoose.model("Token", TokenSchema);