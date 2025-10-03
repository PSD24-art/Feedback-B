const Feedback = require("../models/feedback");
const Token = require("../models/token");

//Createa route which will identify the existing for or token is generated again same faculty subect and student roll, otherwise student will fill full form and after submitting he finds that the form is already submitted
exports.checkFeedback = async (req, res) => {
  const { token } = req.params;
  // Check token exists
  const recievedToken = await Token.findOne({ token });
  if (!recievedToken) {
    return res.status(404).json({ error: "Invalid or expired token" });
  }

  const { studentRoll } = req.body;
  console.log("Checking feedback with:", {
    studentRoll,
    faculty: recievedToken.faculty,
    subject: recievedToken.subject,
  });
  const existingFeedback = await Feedback.findOne({
    studentRoll,
    faculty: recievedToken.faculty,
    subject: recievedToken.subject,
  });

  if (existingFeedback) {
    return res.status(400).json({
      message: false,
      existingFeedback,
    });
  } else {
    res.json({ message: true });
  }
};

exports.postFeedback = async (req, res) => {
  const { token } = req.params;
  const recievedToken = await Token.findOne({ token });
  if (!recievedToken) {
    return res.status(404).json({ error: "Invalid or expired token" });
  }
  try {
    const {
      studentName,
      studentRoll,
      parameter1,
      parameter2,
      parameter3,
      parameter4,
      parameter5,
      overallEffectiveness,
      strengths,
      improvements,
      additionalComments,
    } = req.body;

    //  Mark token as used
    recievedToken.used_by = studentRoll;
    recievedToken.used = true;
    await recievedToken.save();

    // Create feedback
    const feedback = new Feedback({
      studentName,
      studentRoll,
      faculty: recievedToken.faculty,
      subject: recievedToken.subject,
      token: recievedToken._id,
      parameter1,
      parameter2,
      parameter3,
      parameter4,
      parameter5,
      overallEffectiveness,
      strengths,
      improvements,
      additionalComments,
    });

    const result = await feedback.save();
    return res.json({ message: "Feedback submitted successfully", result });
  } catch (error) {
    console.error("postFeedback error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
