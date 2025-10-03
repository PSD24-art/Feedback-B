const { required } = require("joi");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");

// main()
//   .then(() => console.log("Database Connected"))
//   .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/feedbackSys");
}

const subjectSchema = new Schema({
  name: { type: String, required: true },
  code: { type: Number, require: true, min: 1, max: 15 },
  department: { type: String, require: true },
  faculty: { type: Schema.Types.ObjectId, ref: "Faculty" },
  semester: { type: String, required: true },
  created_by: { type: Schema.Types.ObjectId, ref: "Faculty" },
  unique_code: { type: String, required: true, unique: true },
});

const Subject = mongoose.model("Subject", subjectSchema);

const addSubject = async () => {
  // await Subject.deleteMany({});
  try {
    // Find faculty document
    // let faculty = await Faculty.findById("68bfcc5040a25156e4a60c69");
    // if (!faculty) {
    //   console.log("Faculty not found!");
    //   return;
    // }

    // Create subject with reference
    let subject = new Subject({
      name: "CF",
      code: "CS0706",
      semester: 7,
      department: "Computer Science",
    });

    let res = await subject.save();
    console.log("Subject Saved:", res);
  } catch (err) {
    console.log("Error:", err);
  }
};

// addSubject();

module.exports = Subject;
