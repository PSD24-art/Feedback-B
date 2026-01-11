const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const fblinkSchema = new Schema({
  faculty: { type: Schema.Types.ObjectId, ref: "Faculty" },
  subject: { type: Schema.Types.ObjectId, ref: "Subject" },
  link: { type: String, required: true },
  limit: { type: Number, max: 100 },
  term: { type: String },
  created_at: { type: Date, default: Date.now },
});

const FeedbackLink = mongoose.model("FeedbackLink", fblinkSchema);
module.exports = FeedbackLink;

// main()
//   .then(() => console.log("Databse Connected"))
//   .catch((err) => console.log(err));
// async function main() {
//   await mongoose.connect("mongodb://127.0.0.1:27017/feedbackSys");
// }
