const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
});

module.exports = User = mongoose.model("refreshToken", refreshTokenSchema);
