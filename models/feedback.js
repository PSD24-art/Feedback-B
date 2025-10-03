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
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  }, // track who gave feedback

  // Parameters 1–5 (Likert scale ratings, e.g. 1–5)
  parameter1: {
    q1: { type: Number, min: 1, max: 5 }, // strong understanding
    q2: { type: Number, min: 1, max: 5 }, // explains clearly
    q3: { type: Number, min: 1, max: 5 }, // relates to real-life
  },
  parameter2: {
    q1: { type: Number, min: 1, max: 5 }, // encourages participation
    q2: { type: Number, min: 1, max: 5 }, // effective teaching methods
    q3: { type: Number, min: 1, max: 5 }, // uses AI/digital tools
    q4: { type: Number, min: 1, max: 5 }, // motivates self-learning
  },
  parameter3: {
    q1: { type: Number, min: 1, max: 5 }, // communicates effectively
    q2: { type: Number, min: 1, max: 5 }, // approachable
    q3: { type: Number, min: 1, max: 5 }, // equal opportunities
  },
  parameter4: {
    q1: { type: Number, min: 1, max: 5 }, // constructive feedback
    q2: { type: Number, min: 1, max: 5 }, // fair evaluation
    q3: { type: Number, min: 1, max: 5 }, // helps understand mistakes
  },
  parameter5: {
    q1: { type: Number, min: 1, max: 5 }, // maintains discipline
    q2: { type: Number, min: 1, max: 5 }, // punctual
    q3: { type: Number, min: 1, max: 5 }, // treats fairly
  },

  // Parameter 6 (open-ended)
  overallEffectiveness: { type: Number, min: 1, max: 5 }, // optional numeric rating
  strengths: { type: String },
  improvements: { type: String },
  additionalComments: { type: String },

  createdAt: { type: Date, default: Date.now },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;
