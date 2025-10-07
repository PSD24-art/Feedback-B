const mongoose = require("mongoose");
const { Schema } = require("mongoose");
// main()
//   .then(() => console.log("Databse Connected"))
//   .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/feedbackSys");
}

const feedbackSchema = new Schema({
  studentName: {
    type: String,
    required: true,
  },
  studentRoll: {
    type: String,
    required: true,
  },
  faculty: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject: {
    type: Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  token: {
    type: Schema.Types.ObjectId,
    ref: "Token",
    required: true,
  },

  // Parameters 1
  parameter1: {
    q1: { type: Number, min: 1, max: 5 },
    q2: { type: Number, min: 1, max: 5 },
  },
  parameter2: {
    q1: { type: Number, min: 1, max: 5 },
    q2: { type: Number, min: 1, max: 5 },
    q3: { type: Number, min: 1, max: 5 },
    q4: { type: Number, min: 1, max: 5 },
  },
  parameter3: {
    q1: { type: Number, min: 1, max: 5 },
    q2: { type: Number, min: 1, max: 5 },
    q3: { type: Number, min: 1, max: 5 },
    q4: { type: Number, min: 1, max: 5 },
  },
  parameter4: {
    q1: { type: Number, min: 1, max: 5 },
    q2: { type: Number, min: 1, max: 5 },
    q3: { type: Number, min: 1, max: 5 },
  },
  parameter5: {
    q1: { type: Number, min: 1, max: 5 },
    q2: { type: Number, min: 1, max: 5 },
    q3: { type: Number, min: 1, max: 5 },
  },

  // Parameter 6 (open-ended)
  overallEffectiveness: { type: Number, min: 1, max: 5 },
  strengths: { type: String },
  improvements: { type: String },
  additionalComments: { type: String },

  createdAt: { type: Date, default: Date.now },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;
