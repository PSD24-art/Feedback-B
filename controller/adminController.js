const Faculty = require("../models/faculty");
const Subject = require("../models/subject");
const FeedbackLink = require("../models/feedbackLink");
const Feedback = require("../models/feedback");
const validator = require("validator");
const nodemailer = require("nodemailer");
require("dotenv").config();

exports.getFaculties = async (req, res) => {
  try {
    const { id } = req.params;
    let admin = await Faculty.findById(id);
    const allFaculties = await Faculty.find({ role: "faculty" });
    //   console.log(allFaculties);
    res.json({ admin, allFaculties });
  } catch (e) {
    res.status(404).json({
      message: "Failed to fetch faculties and Admin",
      error: e.message,
    });
  }
};

exports.postFaculty = async (req, res) => {
  const { name, email, department } = req.body;
  let username = email.toLowerCase().split("@")[0] + "@tiet";
  const newFaculty = new Faculty({
    username,
    name,
    email,
    department,
    role: "faculty",
  });

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const defPass = "defaultPassword";

  try {
    console.log("Checking existing faculty...");
    const checkExistingFaculty = await Faculty.findOne({ username });
    if (checkExistingFaculty) {
      return res
        .status(409)
        .json({ message: "Faculty exists with same email id" });
    }

    console.log("Registering new faculty...");
    const result = await Faculty.register(newFaculty, defPass);

    console.log("Faculty registered:", result);

    // 🔹 Setup Nodemailer transport
    const transporter = nodemailer.createTransport({
      service: "gmail", // or "hotmail", "yahoo", etc.
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // app password (not raw Gmail password!)
      },
    });

    // 🔹 Send email
    const mailOptions = {
      from: `"Feedback Guru" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Faculty Account Has Been Created",
      text: `Hello ${name},\n\nYour faculty account has been created successfully.\n\nUsername: ${username}\nPassword: ${defPass}\n\nPlease login and change your password.\n\nRegards,\nFeedback Guru`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Faculty added successfully & email sent", result });
  } catch (e) {
    console.error("Error in postFaculty:", e);
    res.status(500).json({ error: e.message });
  }
};

exports.getOneFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    let faculty = await Faculty.findById(id);
    //all subjects should be hardcoded in the databse
    const subject = await Subject.find({ faculty: faculty._id });
    if (!subject) {
      res.status(404).json({ error: "no subjects to fetch" });
    }
    if (!faculty) {
      res.status(404).json({ error: "no subjects to fetch" });
    }
    res.json({ faculty, subject });
  } catch (e) {
    console.log(e.message);
    res.json({ error: e.message });
  }
};

exports.deleteFaculty = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const deleteFaculty = await Faculty.findByIdAndDelete(id);
  console.log(deleteFaculty);
  res.json({ message: "Faculty Deleted Successfully", deleteFaculty });
};

//Controller for getting faculty links
exports.getFeedbackLinkAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const links = await FeedbackLink.find({ faculty: id }).populate(
      "subject",
      "name unique_code"
    );

    res.json({ links });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

//Controller for getting feedback docs and count
exports.getFeedbackCountAdmin = async (req, res) => {
  try {
    const { id, subject } = req.params;
    const result = await Feedback.find({ faculty: id, subject });

    if (result.length === 0) {
      return res.json({
        message: "No Data yet",
        Feedbacks: [],
        FeedbackLength: 0,
      });
    }

    console.log("Found feedbacks:", result.length);
    res.json({ Feedbacks: result, FeedbackLength: result.length });
  } catch (e) {
    console.error("Error in getFeedbackCount:", e);
    res.status(500).json({ error: e.message });
  }
};
