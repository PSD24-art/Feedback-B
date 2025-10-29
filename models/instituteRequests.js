const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const institueRequestSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String },
  contactInfo: {
    email: { type: String },
    phone: { type: Number },
    website: { type: String },
  },
  address: {
    type: String,
  },
  contactPerson: {
    name: String,
    mobile: Number,
    email: String,
  },
  adminUser: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const InstituteRequest = mongoose.model(
  "InstituteRequest",
  institueRequestSchema
);

module.exports = InstituteRequest;
