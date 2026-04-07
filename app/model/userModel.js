const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  image: {
    url: {
      type: String,
      required: true,
    },
    fileId: {
      type: String,
      required: true,
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
    required: true
  }
});

module.exports = mongoose.model("User", UserSchema);
