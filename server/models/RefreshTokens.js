const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true }, // hash of the raw token
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  replacedByToken: { type: String, default: null },
  ip: { type: String },
  userAgent: { type: String },
});

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);
