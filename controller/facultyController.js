const Faculty = require("../models/faculty");
const Feedback = require("../models/feedback");
const FeedbackLink = require("../models/feedbackLink");
const Subject = require("../models/subject");
const Token = require("../models/token");
const { v4: uuidv4 } = require("uuid");
const PORT = 3420;

exports.getFaculty = async (req, res) => {
  const { id } = req.params;
  if (req.user._id.toString() === id) {
    let faculty = await Faculty.findById(id);
    // console.log(faculty);

    //all subjects should be hardcoded in the databse
    const subject = await Subject.find({ faculty: faculty._id });
    // console.log(subject);

    if (!subject) {
      return res.status(404).json({ error: "no subjects to fetch" });
    }
    if (!faculty) {
      return res.status(404).json({ error: "no subjects to fetch" });
    }
    console.log("Faculty: ", faculty, " Subject: ", subject);

    res.json({ faculty });
  }
};

exports.getSubject = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() !== id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const subject = await Subject.find({ faculty: id });
    res.json({ subject });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.putSubject = async (req, res) => {
  const { id } = req.params;
  if (req.user._id.toString() === id) {
    let faculty = await Faculty.findById(id);
    // console.log(faculty);
    const { code } = req.body;
    console.log(code);
    //subjects should be added by faculty
    const subject = await Subject.findOne({ unique_code: code });

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }
    if (subject.faculty !== faculty) {
      subject.faculty = faculty;
    } else {
      res.json({ message: "Faculty exists with the selected subjects" });
    }

    const result = await subject.save();
    console.log("Put subject", result);

    res.json({ subjectWithFaculty: subject });
  }
};

exports.postSubject = async (req, res) => {
  const { id } = req.params;
  if (req.user._id.toString() === id) {
    let faculty = await Faculty.findById(id);
    // console.log(faculty);
    const { name, code, department, semester } = req.body;
    console.log(name, code, department, semester);

    const unique_code = department + semester + code;
    const findExistingSubject = await Subject.findOne({ unique_code });
    if (findExistingSubject)
      return res.status(500).json({ error: "Subject already exists!" });

    const newSubject = new Subject({
      name,
      code,
      department,
      semester,
      unique_code,
    });

    const subject = await newSubject.save();

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found!" });
    }

    if (!subject) {
      return res.status(404).json({ error: "Subject not saved!" });
    }

    subject.created_by = faculty;
    const result = await subject.save();
    console.log("New Subject", result);
    res.json({ message: "Subject saved!", subject, created_by: faculty });
  }
};

exports.getToken = async (req, res) => {
  const { id, code } = req.params;
  try {
    const token = uuidv4();
    let subject = await Subject.findOne({ unique_code: code });
    if (subject) {
      const newToken = new Token({
        token: token,
        faculty: id,
        subject: subject,
      });

      await newToken.save();
      res.json({
        // link: `http://localhost:${PORT}/feedback/${token}`, //React new Link
        newToken,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ error });
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
    console.log("subject", subject);
    // Verify faculty exists
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // Check if feedback link already exists
    const existingLink = await FeedbackLink.findOne({ subject, link });

    if (existingLink) {
      const createdByFaculty = await Faculty.findById(existingLink.faculty);
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
    console.log("deleted Link", result);
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
