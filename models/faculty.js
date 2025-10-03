const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
// main()
//   .then(() => console.log("Databse Connected"))
//   .catch((err) => console.log(err));

// async function main() {
//   await mongoose.connect("mongodb://127.0.0.1:27017/feedbackSys");
// }

const facultySchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: String,
  department: String,
  role: { type: String, required: true },
  isPasswordSet: { type: Boolean, default: false },
});
facultySchema.plugin(passportLocalMongoose);
const Faculty = mongoose.model("Faculty", facultySchema);

module.exports = Faculty;

// const addFaculty = async () => {
//   // await Faculty.deleteMany({});
//   // let newFaculty = new Faculty({
//   //   username: "dtingole",
//   //   name: "D. T. Ingole",
//   //   email: "djmanowar@tietdarapur.ac.in",
//   //   password: "DTINGOLE",
//   //   department: "Computer Science",
//   //   role: "admin",
//   // });
//   // let res = await newFaculty.save();
//   // let admin = await Faculty.findByIdAndUpdate("68bfcbaec6cf4d7bfd577df7");
//   // admin.username = "dtingole";
//   // let res = await admin.save();
//   // console.log("Result", res);
//   // let res = await Faculty.insertMany([
//   //   {
//   //     name: "D. J. Manowar",
//   //     email: "djmanowar@tietdarapur.ac.in",
//   //     password: "DJMANOWAR",
//   //     department: "Computer Science",
//   //     role: "faculty",
//   //   },
//   //   {
//   //     name: "T. N. Ghorsad",
//   //     email: "tnghorsad@tietdarapur.ac.in",
//   //     password: "TNGHORSAD",
//   //     department: "Computer Science",
//   //     role: "faculty",
//   //   },
//   // ]);
//   // console.log(res);
// };
// addFaculty();

// const seedAdmin = async () => {
//   const admin = new Faculty({
//     name: "D. T. Ingole",
//     username: "dtingole",
//     email: "dtingole@tietdarapu.in",
//     role: "admin",
//     isPasswordSet: false,
//   });
//   const newAdmin = await Faculty.register(admin, "defaultPassword");
//   console.log(admin);
// };
// seedAdmin();
