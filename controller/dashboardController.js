const FeedbackLink = require("../models/feedbackLink");

// GET all distinct terms for a faculty
exports.getFacultyTerms = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Faculty ID is required" });
    }

    const terms = await FeedbackLink.distinct("term", {
      faculty: id,
      term: { $exists: true, $ne: "" },
    });

    // Optional: sort terms (latest first)
    terms.sort().reverse();

    res.status(200).json({ terms });
  } catch (error) {
    console.error("Error fetching faculty terms:", error);
    res.status(500).json({ error: "Failed to fetch terms" });
  }
};
