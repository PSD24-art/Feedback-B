const mongoose = require("mongoose");
const { Schema } = require("mongoose");
// main()
//   .then(() => console.log("Databse Connected"))
//   .catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/feedbackSys");
}

const fblinkSchema = new Schema({
  faculty: { type: Schema.Types.ObjectId, ref: "Faculty" },
  subject: { type: Schema.Types.ObjectId, ref: "Subject" },
  link: { type: String, required: true },
});

const FeedbackLink = mongoose.model("FeedbackLink", fblinkSchema);
module.exports = FeedbackLink;
