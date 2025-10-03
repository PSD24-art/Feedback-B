const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
require("dotenv").config({ path: "../.env" });

main()
  .then(() => console.log("Databse Connected"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
}

const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: String,
  department: String,
  institute: { type: Schema.Types.ObjectId, ref: "Institute", required: true },
  role: { type: String, required: true },
  isPasswordSet: { type: Boolean, default: false },
});
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);

module.exports = User;

// const addUser = async () => {
//   // await User.deleteMany({});
//   // let newUser = new User({
//   //   username: "dtingole",
//   //   name: "D. T. Ingole",
//   //   email: "djmanowar@tietdarapur.ac.in",
//   //   password: "DTINGOLE",
//   //   department: "Computer Science",
//   //   role: "admin",
//   // });
//   // let res = await newUser.save();
//   // let admin = await User.findByIdAndUpdate("68bfcbaec6cf4d7bfd577df7");
//   // admin.username = "dtingole";
//   // let res = await admin.save();
//   // console.log("Result", res);
//   // let res = await User.insertMany([
//   //   {
//   //     name: "D. J. Manowar",
//   //     email: "djmanowar@tietdarapur.ac.in",
//   //     password: "DJMANOWAR",
//   //     department: "Computer Science",
//   //     role: "User",
//   //   },
//   //   {
//   //     name: "T. N. Ghorsad",
//   //     email: "tnghorsad@tietdarapur.ac.in",
//   //     password: "TNGHORSAD",
//   //     department: "Computer Science",
//   //     role: "User",
//   //   },
//   // ]);
//   // console.log(res);
// };
// addUser();

// const seedAdmin = async () => {
//   const admin = new User({
//     name: "Prathamesh Dahake",
//     username: "pratham@tiet",
//     email: "prathameshd025@tietdarapu.in",
//     role: "admin",
//     isPasswordSet: false,
//     institute: "68dfb1dee6ee3ac5e76bcab0",
//   });
//   const newAdmin = await User.register(admin, "defaultPassword");
//   console.log(admin);
// };
// seedAdmin();
