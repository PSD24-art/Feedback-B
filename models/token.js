const mongoose = require("mongoose");
const { Schema } = require("mongoose");
// main()
//   .then(() => console.log("Databse Connected"))
//   .catch((err) => console.log(err));

// async function main() {
//   await mongoose.connect("mongodb://127.0.0.1:27017/feedbackSys");
// }

const tokenSchema = new Schema({
  token: { type: String, required: true, unique: true },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  used_by: String,
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: "7d" },
});

const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;
