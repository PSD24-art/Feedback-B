const User = require("../models/user");
const Subject = require("../models/subject");
const FeedbackLink = require("../models/feedbackLink");
const Feedback = require("../models/feedback");
const Institute = require("../models/institute");
const OPENROUTER_API_KEY = process.env.OPENROUTER_API;
const validator = require("validator");
const nodemailer = require("nodemailer");
const feedbackCalculator = require("../utils/feedbackCalculator");
const criteriWiseCharts = require("../utils/criteriaWiseBarChart");
const analyzeRatings = require("../utils/analyzeRatings");
require("dotenv").config();
exports.getFaculties = async (req, res) => {
  const { id } = req.params;
  if (req.user._id.toString() === id) {
    try {
      let admin = await User.findById(id).populate("institute", "name code");
      const instituteId = admin.institute;
      // const institute = await Institute.findById(instituteId);
      // console.log(institute);
      const allFaculties = await User.find({
        role: "faculty",
        institute: instituteId,
      });
      // console.log(allFaculties);
      res.json({ admin, allFaculties });
    } catch (e) {
      res.status(404).json({
        message: "Failed to fetch faculties and Admin",
        error: e.message,
      });
    }
  }
};

exports.postFaculty = async (req, res) => {
  const { id } = req.params;
  if (req.user._id.toString() === id) {
    const { name, email, department } = req.body;
    let username = email.toLowerCase().split("@")[0] + "@tiet";
    let admin = await User.findById(id);
    const instituteId = admin.institute;
    const newFaculty = new User({
      username,
      name,
      email,
      department,
      institute: instituteId,
      role: "faculty",
    });

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const defPass = "defaultPassword";

    try {
      const checkExistingFaculty = await User.findOne({ username });
      if (checkExistingFaculty) {
        return res
          .status(409)
          .json({ message: "User exists with same email id" });
      }

      const result = await User.register(newFaculty, defPass);

      // console.log("User registered:", result);

      // //Setup Nodemailer transport
      // const transporter = nodemailer.createTransport({
      //   service: "gmail", // or "hotmail", "yahoo", etc.
      //   auth: {
      //     user: process.env.EMAIL_USER,
      //     pass: process.env.EMAIL_PASS,
      //   },
      // });

      // //Send email
      // const mailOptions = {
      //   from: `"Feedback Guru" <${process.env.EMAIL_USER}>`,
      //   to: email,
      //   subject: "Your User Account Has Been Created",
      //   text: `Hello ${name},\n\nYour faculty account has been created successfully.\n\nUsername: ${username}\nPassword: ${defPass}\n\nPlease login and change your password.\n\nRegards,\nFeedback Guru`,
      // };

      // await transporter.sendMail(mailOptions);

      res.json({ message: "User added successfully & email sent", result });
    } catch (e) {
      console.error("Error in postFaculty:", e);
      res.status(500).json({ error: e.message });
    }
  }
};

exports.getOneFaculty = async (req, res) => {
  const { id, facultyId } = req.params;
  if (req.user._id.toString() === id) {
    try {
      let faculty = await User.findById(facultyId);
      const subject = await Subject.find({ faculty: faculty._id });
      if (!subject) {
        res.status(404).json({ error: "no subjects to fetch" });
      }
      if (!faculty) {
        res.status(404).json({ error: "no subjects to fetch" });
      }

      // all feedback links created by this faculty
      const feedbackLinks = await FeedbackLink.find({ faculty: facultyId });
      const subjectIds = feedbackLinks.map((link) => link.subject.toString());

      //  subject names
      const subjectNames = await Promise.all(
        subjectIds.map(async (sid) => {
          const subject = await Subject.findById(sid);
          return subject ? subject.name : "Unknown Subject";
        })
      );

      // Fetch feedbacks per subject
      const feedbackArrays = await Promise.all(
        subjectIds.map((sid) =>
          Feedback.find({ faculty: facultyId, subject: sid })
        )
      );

      // Calculate average ratings
      const overallAvgArray = feedbackArrays.map((feedbackArr) => {
        if (!feedbackArr.length) return 0;
        const avg = feedbackCalculator(feedbackArr);
        return Number.isNaN(avg) ? 0 : Number(avg.toFixed(2));
      });

      let sumOfAvg = 0;
      for (let i = 0; i < overallAvgArray.length; i++) {
        sumOfAvg = sumOfAvg + overallAvgArray[i];
      }

      const totalRating = (sumOfAvg / overallAvgArray.length).toFixed(2);
      // console.log("Total ratings: ", totalRating);

      // response object
      const ratingObjects = subjectNames.map((name, i) => ({
        subjectName: name,
        avgRating: overallAvgArray[i],
      }));

      // console.log("Ratings Objects: ", ratingObjects);
      const ratingsForAi = analyzeRatings(ratingObjects);
      // console.log("ratings for AI Subjects: ", ratingsForAi);
      res.json({ faculty, subject, ratingObjects, totalRating, ratingsForAi });
    } catch (e) {
      console.log(e.message);
      res.json({ error: e.message });
    }
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
        "name unique_code"
      );

      res.json({ links });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
};

//Controller for getting feedback docs and count
exports.getFeedbackCountAdmin = async (req, res) => {
  const { id, facultyId, subject } = req.params;
  if (req.user._id.toString() === id) {
    try {
      const result = await Feedback.find({ faculty: facultyId, subject });

      if (result.length === 0) {
        return res.json({
          message: "No Data yet",
          Feedbacks: [],
          FeedbackLength: 0,
        });
      }
      const ratings = criteriWiseCharts(result);

      if (!ratings)
        return res.json({
          FeedbackLength: result.length,
          ratings: "No ratings found",
        });
      // console.log("Found feedbacks:", result.length);
      const fallbackRatings = [
        { criteria: "Communication" },
        { criteria: "Knowledge" },
        { criteria: "Engagement" },
        { criteria: "Punctuality" },
        { criteria: "Doubt Solving" },
      ];

      const dataset =
        Array.isArray(ratings) && ratings.length > 0
          ? fallbackRatings.map((item, i) => ({
              criteria: item.criteria,
              avgRating: Number(ratings[i]) || 0,
            }))
          : fallbackRatings;

      const criteriaRatingsAi = analyzeRatings(dataset);
      res.json({ ratings, FeedbackLength: result.length, criteriaRatingsAi });
    } catch (e) {
      console.error("Error in getFeedbackCount:", e);
      res.status(500).json({ error: e.message });
    }
  }
};

exports.getFacultySummary = async (req, res) => {
  try {
    const { facultyName, criteriaAnalysis, subjectAnalysis } = req.body;

    const prompt = `
You are an AI evaluator assessing a faculty member based on feedback data.

Faculty Name: ${facultyName}

Criteria Analysis:
Average Rating: ${criteriaAnalysis.avg} (${criteriaAnalysis.performanceLevel})
Strongest Area: ${criteriaAnalysis.strongest.criteria} (${criteriaAnalysis.strongest.avgRating})
Weakest Area: ${criteriaAnalysis.weakest.criteria} (${criteriaAnalysis.weakest.avgRating})

Subject Analysis:
Average Rating: ${subjectAnalysis.avg} (${subjectAnalysis.performanceLevel})
Best Subject: ${subjectAnalysis.strongest.subjectName} (${subjectAnalysis.strongest.avgRating})
Weakest Subject: ${subjectAnalysis.weakest.subjectName} (${subjectAnalysis.weakest.avgRating})

Task:
Write a 4–6 line professional summary describing the faculty’s performance.
Highlight strengths, areas for improvement, and end with an overall remark (Excellent / Good / Needs Improvement).
Avoid numbers, write qualitatively.
`;
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 300,
        }),
      }
    );

    const data = await response.json();
    let summary =
      data?.choices?.[0]?.message?.content || "No summary generated.";
    // console.log("Generated Summary:", summary);
    summary = summary
      .replace(/<s>/g, "")
      .replace(/\[OUT\]/gi, "")
      .replace(/\[.*?\]/g, "")
      .replace(/\\n/g, " ")
      .trim();

    res.json({ summary });
  } catch (error) {
    console.error("AI Summary Error:", error);
    res.status(500).json({ error: "AI summarization failed." });
  }
};
