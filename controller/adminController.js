const User = require("../models/user");
const Subject = require("../models/subject");
const FeedbackLink = require("../models/feedbackLink");
const Feedback = require("../models/feedback");
const Institute = require("../models/institute");
const validator = require("validator");
const nodemailer = require("nodemailer");
const feedbackCalculator = require("../utils/getAggregatedSubjectRatings");
const criteriWiseCharts = require("../utils/criteriaWiseBarChart");
const analyzeRatings = require("../utils/analyzeRatings");
const percentageForPie = require("../utils/percentageForPie");
require("dotenv").config();

exports.getFaculties = async (req, res) => {
  const { id, dept } = req.params;
  if (req.user._id.toString() === id) {
    try {
      let admin = await User.findById(id).populate("institute", "name code");
      const instituteId = admin.institute;
      const allFaculties = await User.find({
        role: "faculty",
        institute: instituteId,
        department: dept,
      });

      res.json({ admin, allFaculties });
    } catch (e) {
      res.status(404).json({
        message: "Failed to fetch faculties and Admin",
        error: e.message,
      });
    }
  }
};
exports.deleteSubjects = async (req, res) => {
  const { id, subjectId } = req.params;
  if (req.user._id.toString() === id) {
    const subject = await Subject.findByIdAndDelete(subjectId);
    console.log(subject);
    if (subject) {
      res.json({ message: `${subject.name} deleted successfully` });
    }
  }
};
exports.postSubject = async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() !== id) {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  try {
    const admin = await User.findById(id);
    if (!admin) {
      return res.status(404).json({ error: "User not found!" });
    }

    const { name, code, department, semester } = req.body;

    // unique code (department + semester + code)
    const unique_code = `${department}${semester}${code}`;

    // check existing subject
    const findExistingSubject = await Subject.findOne({ unique_code });
    if (findExistingSubject) {
      return res.status(400).json({ error: "Subject already exists!" });
    }

    // create new subject
    const newSubject = new Subject({
      name,
      code,
      department,
      semester,
      unique_code,
      institute: admin.institute,
      created_by: admin._id,
    });

    const savedSubject = await newSubject.save();

    res.status(201).json({
      message: "Subject saved successfully!",
      subject: savedSubject,
      created_by: admin,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to save subject",
      error: err.message,
    });
  }
};

exports.getSubjects = async (req, res) => {
  const { id, dept } = req.params;
  if (req.user._id.toString() === id) {
    const allSubjects = await Subject.find({ department: dept }).populate(
      "created_by",
      "name",
    );
    if (allSubjects) {
      res.json({ subjects: allSubjects });
    } else {
      res.status(404).json({ message: "Subjects not found" });
    }
  }
};

exports.postFaculty = async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() === id) {
    const { name, email, department } = req.body;

    const username = email.toLowerCase().split("@")[0] + "@tiet";
    const admin = await User.findById(id);
    const instituteId = admin.institute;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const defPass = "defaultPassword";

    try {
      const existing = await User.findOne({ username });
      if (existing) {
        return res
          .status(409)
          .json({ message: "User already exists with same email id" });
      }

      const newFaculty = new User({
        username,
        name,
        email,
        department,
        institute: instituteId,
        role: "faculty",
      });

      const result = await User.register(newFaculty, defPass);

      // const transporter = nodemailer.createTransport({
      //   host: process.env.BREVO_HOST,
      //   port: process.env.BREVO_PORT,
      //   secure: false,
      //   auth: {
      //     user: process.env.BREVO_USER,
      //     pass: process.env.BREVO_PASS,
      //   },
      // });

      //       const mailOptions = {
      //         from: `"Feedback Guru" <${process.env.BREVO_USER}>`,
      //         to: email, // recipient
      //         subject: "Your Faculty Account Has Been Created",
      //         text: `Hello ${name},

      // Your faculty account has been created successfully.

      // Username: ${username}
      // Password: ${defPass}

      // Please login and change your password.

      // Regards,
      // Feedback Guru`,
      //       };

      // try {
      //   const info = await transporter.sendMail(mailOptions);
      //   console.log("Email sent successfully:", info.messageId);
      // } catch (mailErr) {
      //   console.error("Email sending failed via Brevo:", mailErr);
      // }

      res.json({ message: "User added successfully & email sent", result });
    } catch (e) {
      console.error("Error in postFaculty:", e);
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(403).json({ error: "Unauthorized action" });
  }
};

exports.getOneFaculty = async (req, res) => {
  const { id, facultyId, term } = req.params;

  if (req.user._id.toString() !== id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const faculty = await User.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    const filter = { faculty: facultyId };
    if (term !== "ALL") {
      filter.term = term;
    }

    const feedbackLinks = await FeedbackLink.find(filter).populate(
      "subject",
      "name unique_code",
    );

    if (!feedbackLinks.length) {
      return res.json({
        faculty,
        links: [],
        ratingObjects: [],
        totalRating: 0,
        ratingsForAi: {},
      });
    }

    const subjectIds = feedbackLinks.map((link) => link.subject._id);

    // 1. Fetch pre-calculated database averages via utility
    const ratingLookup = await feedbackCalculator.getAggregatedSubjectRatings(
      facultyId,
      subjectIds,
      term,
    );

    // 2. Map links to responses cleanly (maintains database sort layout and appends 0 if empty)
    const ratingObjects = feedbackLinks.map((link) => {
      const subjectIdStr = link.subject?._id?.toString();
      return {
        subjectName: link.subject?.name || "Unknown Subject",
        avgRating: ratingLookup.get(subjectIdStr) || 0,
      };
    });

    // 3. Compute the structural overall total rating score
    const dynamicAverages = ratingObjects.map((r) => r.avgRating);
    const sumOfAvg = dynamicAverages.reduce((a, b) => a + b, 0);
    const totalRating =
      dynamicAverages.length > 0
        ? (sumOfAvg / dynamicAverages.length).toFixed(2)
        : "0.00";

    // 4. Fire analytics logic
    const ratingsForAi = analyzeRatings(ratingObjects);

    return res.json({
      faculty,
      links: feedbackLinks,
      ratingObjects,
      totalRating,
      ratingsForAi,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

exports.deleteFaculty = async (req, res) => {
  const { id, facultyId } = req.params;
  if (req.user._id.toString() === id) {
    const deleteFaculty = await User.findByIdAndDelete(facultyId);
    res.json({ message: "Faculty Deleted Successfully", deleteFaculty });
  }
};

//Controller for getting faculty links
exports.getFeedbackLinkAdmin = async (req, res) => {
  const { id, facultyId } = req.params;
  if (req.user._id.toString() === id) {
    try {
      const links = await FeedbackLink.find({ faculty: facultyId }).populate(
        "subject",
        "name unique_code",
      );

      res.json({ links });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
};

//Controller for getting feedback docs and count
const mongoose = require("mongoose");
const { extractJSON } = require("../utils/extractjson");
const { getFacultyAiSummary } = require("../utils/getFacultyAiSummary");

exports.getFeedbackCountAdmin = async (req, res) => {
  const { id, facultyId, subject } = req.params;
  const { term } = req.query; // ✅ optional term support

  // 🔐 Authorization
  if (req.user._id.toString() !== id) {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  // ✅ Validate ObjectIds
  if (
    !mongoose.Types.ObjectId.isValid(facultyId) ||
    !mongoose.Types.ObjectId.isValid(subject)
  ) {
    return res.status(400).json({ error: "Invalid faculty or subject ID" });
  }

  try {
    // 🔍 Build query safely
    const query = {
      faculty: facultyId,
      subject,
    };

    if (term && term !== "ALL") {
      query.term = term;
    }

    // 📦 Fetch feedbacks
    const feedbacks = await Feedback.find(query);

    // 🧱 Fallback criteria structure
    const fallbackRatings = [
      { criteria: "Communication", avgRating: 0 },
      { criteria: "Knowledge", avgRating: 0 },
      { criteria: "Engagement", avgRating: 0 },
      { criteria: "Punctuality", avgRating: 0 },
      { criteria: "Doubt Solving", avgRating: 0 },
    ];

    if (feedbacks.length === 0) {
      return res.json({
        FeedbackLength: 0,
        ratings: fallbackRatings,
        ratingPercentage: {},
        criteriaRatingsAi: {},
      });
    }

    // 📊 Criteria-wise averages
    const rawRatings = criteriWiseCharts(feedbacks);

    const dataset = fallbackRatings.map((item, i) => ({
      criteria: item.criteria,
      avgRating: Number(rawRatings?.[i]) || 0,
    }));

    // 🍩 Percentage for pie/donut
    const { ratingPercentages } = percentageForPie(feedbacks);

    // 🤖 AI analysis
    const criteriaRatingsAi = analyzeRatings(dataset);

    // ✅ Consistent response
    return res.json({
      FeedbackLength: feedbacks.length,
      ratings: dataset,
      ratingPercentage: ratingPercentages,
      criteriaRatingsAi,
    });
  } catch (e) {
    console.error("Error in getFeedbackCountAdmin:", e);
    return res.status(500).json({ error: e.message });
  }
};

exports.getFacultySummary = async (req, res) => {
  await getFacultyAiSummary(req, res);
};

exports.getPieChartData = (req, res) => {
  const { id, facultyId } = req.params;
  if (req.user._id.toString() === id) {
  }
};
