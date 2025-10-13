const Feedback = require("../models/feedback");
const FeedbackLink = require("../models/feedbackLink");
const Subject = require("../models/subject");
const Token = require("../models/token");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");
const PORT = 3420;
const feedbackCalculator = require("../utils/feedbackCalculator");
const criteriWiseCharts = require("../utils/criteriaWiseBarChart");
const analyzeRatings = require("../utils/analyzeRatings");
require("dotenv").config();

exports.getFaculty = async (req, res) => {
  const { id } = req.params;
  // console.log("User Id: ", id);

  if (req.user._id.toString() !== id) {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  try {
    const faculty = await User.findById(id);
    if (!faculty) return res.status(404).json({ error: "Faculty not found" });

    // all feedback links created by this faculty
    const feedbackLinks = await FeedbackLink.find({ faculty: id });
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
      subjectIds.map((sid) => Feedback.find({ faculty: id, subject: sid }))
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

    //  Send response
    res.json({ faculty, ratingObjects, totalRating, ratingsForAi });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

exports.putSubject = async (req, res) => {
  const { id } = req.params;
  if (req.user._id.toString() === id) {
    let faculty = await User.findById(id);
    const { code } = req.body;
    //subjects should be added by faculty
    const subject = await Subject.findOne({ unique_code: code });

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }
    if (subject.faculty !== faculty._id) {
      subject.faculty = faculty._id;
    } else {
      res.json({ message: "Faculty exists with the selected subjects" });
    }

    const result = await subject.save();
    // console.log("Put subject", result);

    res.json({ subjectWithFaculty: subject });
  }
};

exports.postSubject = async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() !== id) {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  try {
    const faculty = await User.findById(id);
    if (!faculty) {
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
      institute: faculty.institute,
      created_by: faculty._id,
    });

    const savedSubject = await newSubject.save();

    res.status(201).json({
      message: "Subject saved successfully!",
      subject: savedSubject,
      created_by: faculty,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to save subject",
      error: err.message,
    });
  }
};

exports.getToken = async (req, res) => {
  const { id, code } = req.params;
  try {
    const subject = await Subject.findOne({ unique_code: code });
    const faculty = await User.findById(id);

    if (!subject || !faculty) {
      return res.status(404).json({ error: "Faculty or subject not found" });
    }

    const token = uuidv4();
    const newToken = new Token({
      token,
      faculty: faculty._id,
      subject: subject._id,
    });

    const savedToken = await newToken.save();

    // populate after saving (populate works on documents returned from queries)
    const populatedToken = await Token.findById(savedToken._id)
      .populate("faculty", "name")
      .populate("subject", "name unique_code");

    res.json({ newToken: populatedToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getSubjectWithDept = async (req, res) => {
  try {
    const { id, dept } = req.params;
    const department = dept.toUpperCase();
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    if (!department) {
      return res.status(400).json({ error: "Department is required" });
    }
    const subjects = await Subject.find({ department: department });
    res.json({
      message: `subjects found of ${department} department`,
      subjects,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getSubjectWithDeptSem = async (req, res) => {
  try {
    const { id, dept, sem } = req.params;

    if (req.user._id.toString() !== id) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const department = dept.toUpperCase();
    const subjects = await Subject.find({
      semester: sem,
      department: department,
    });
    res.json({
      message: `subjects found of ${department} department and ${sem} semester`,
      subjects,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.postFeedbackLink = async (req, res) => {
  const { id } = req.params;

  try {
    const { subject, link } = req.body;
    // console.log("subject", subject);
    // Verify faculty exists
    const faculty = await User.findById(id);
    if (!faculty) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if feedback link already exists
    const existingLink = await FeedbackLink.findOne({ subject, link });

    if (existingLink) {
      const createdByFaculty = await User.findById(existingLink.faculty);
      const facultyName = createdByFaculty ? createdByFaculty.name : "Unknown";
      return res.json({ message: `Link already created by ${facultyName}` });
    }

    const newLink = new FeedbackLink({
      faculty: faculty._id,
      link,
      subject,
    });

    const result = await newLink.save();
    res.json({ result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteFeedbackLink = async (req, res) => {
  const { id, link } = req.params;
  if (req.user._id.toString() !== id) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  try {
    const result = await FeedbackLink.findByIdAndDelete(link);
    // console.log("deleted Link", result);
    res.json({ message: "Link deleted Successfully" });
  } catch (e) {
    console.log(e);
    res.json({ error: e.message });
  }
};

exports.getFeedbackLink = async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() !== id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

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

exports.getFeedbackCount = async (req, res) => {
  try {
    const { id, subject } = req.params;

    if (req.user._id.toString() !== id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const result = await Feedback.find({ faculty: id, subject });

    if (result.length === 0) {
      return res.json({
        message: "No Data yet",
        FeedbackLength: 0,
        ratings: [
          {
            parameter1: { q1: 1, q2: 2 },
            parameter2: { q1: 4, q2: 3, q3: 3 },
            parameter3: { q1: 3, q2: 4, q3: 4 },
            parameter4: { q1: 4, q2: 4, q3: 2 },
            parameter5: { q1: 1, q2: 5, q3: 3 },
            overallEffectiveness: 4,
            strengths: "2",
            improvements: "1",
            additionalComments: "1",
            __v: 0,
          },
        ],
      });
    }
    const ratings = criteriWiseCharts(result);

    if (!ratings)
      return res.json({
        FeedbackLength: result.length,
        ratings: "No ratings found",
      });

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
    // console.log("criteria Rastings AI: ", criteriaRatingsAi);
    res.json({ FeedbackLength: result.length, ratings, criteriaRatingsAi });
  } catch (e) {
    console.error("Error in getFeedbackCount:", e);
    res.status(500).json({ error: e.message });
  }
};

const OPENROUTER_API_KEY = process.env.OPENROUTER_API;

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
          model: "openai/gpt-3.5-turbo",
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
