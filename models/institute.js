const mongoose = require("mongoose");
const { Schema } = require("mongoose");
require("dotenv").config({ path: "../.env" });

main()
  .then(() => console.log("Databse Connected"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/AI_feedback_Sys");
}

const institueSchema = new Schema({
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

const Institute = mongoose.model("Institute", institueSchema);

module.exports = Institute;

const addInstitute = async () => {
  const institute = new Institute({
    name: "Takshashile Institute of Engineering & Technology",
    code: "TIET",
    contactInfo: {
      name: "Prathamesh Dahake",
      phone: 7499533851,
      email: "prathmeshd025@gmail.com",
    },
  });
  const newInstitute = await institute.save();
  console.log(newInstitute);
};
addInstitute();
