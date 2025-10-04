const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
// require("dotenv").config({ path: "../.env" });

// main()
//   .then(() => console.log("Databse Connected"))
//   .catch((err) => console.log(err));

// async function main() {
//   await mongoose.connect(process.env.MONGO_URI);
// }

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

// const addFaculty = async () => {
//   // await User.deleteMany({});
//   const faculty1 = new User({
//     name: "D. J. Manowar",
//     username: "djmanowar",
//     email: "djmanowar@tietdarapur.ac.in",
//     department: "Computer Science",
//     institute: "68dffb0d52a756b9b99f98d1",
//     role: "faculty",
//   });
//   try {
//     const res = await User.register(faculty1, "defaultPassword");
//     console.log(res);
//   } catch (e) {
//     console.log(e);
//   }
// };
// addFaculty();

// const seedAdmin = async () => {
//   const admin = new User({
//     name: "Prathamesh Dahake",
//     username: "pratham@tiet",
//     email: "prathameshd025@tietdarapu.in",
//     role: "admin",
//     isPasswordSet: false,
//     institute: "68dffb0d52a756b9b99f98d1",
//   });
//   const newAdmin = await User.register(admin, "defaultPassword");
//   console.log(newAdmin);
// };
// seedAdmin();
