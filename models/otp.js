// models/Otp.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const otpSchema = new Schema({
  email: { type: String, require: true },
  otpHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
});

// TTL index to auto-delete expired docs (ensure Mongo supports TTL)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Opt = mongoose.model("Otp", otpSchema);
module.exports = Opt;
