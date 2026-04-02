const Feedback = require("../models/feedback");
const Subject = require("../models/subject");
const User = require("../models/user");
const ExcelJS = require("exceljs");

const calculateNumberAverage = (feedbacks, fieldName) => {
  let sum = 0;
  let count = 0;

  for (const feedback of feedbacks) {
    const value = feedback[fieldName];

    if (typeof value === "number") {
      sum += value;
      count += 1;
    }
  }

  return count > 0 ? roundToTwo(sum / count) : 0;
};

const roundToTwo = (value) => Number(value.toFixed(2));

const calculateSectionAverage = (feedbacks, parameterKey, questionKeys) => {
  let sum = 0;
  let count = 0;

  for (const feedback of feedbacks) {
    const parameter = feedback[parameterKey] || {};

    for (const questionKey of questionKeys) {
      const rating = parameter[questionKey];

      if (typeof rating === "number") {
        sum += rating;
        count += 1;
      }
    }
  }

  return count > 0 ? roundToTwo(sum / count) : 0;
};

exports.generateFacultyReport = async (req, res) => {
  try {
    const { facultyId } = req.body;

    if (!facultyId) {
      return res.status(400).json({
        error: "facultyId is required",
      });
    }

    // 1. Fetch all feedbacks of faculty
    const feedbacks = await Feedback.find({
      faculty: facultyId,
    }).lean();

    if (!feedbacks.length) {
      return res.status(404).json({
        error: "No feedback data found for this faculty",
      });
    }

    // 2. Get faculty name
    const faculty = await User.findById(facultyId).select("name").lean();

    // 3. Group by subject + term
    const grouped = {};

    feedbacks.forEach((fb) => {
      const key = `${fb.subject}_${fb.term}`;

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(fb);
    });

    // 4. Get subject names (optimize lookup)
    const subjectIds = [...new Set(feedbacks.map((f) => f.subject.toString()))];

    const subjects = await Subject.find({
      _id: { $in: subjectIds },
    }).lean();

    const subjectMap = {};
    subjects.forEach((s) => {
      subjectMap[s._id.toString()] = s.name;
    });

    // 5. Create Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Final_Report");

    worksheet.columns = [
      { header: "Faculty", key: "faculty", width: 24 },
      { header: "Subject", key: "subject", width: 24 },
      { header: "Term", key: "term", width: 16 },
      { header: "P1 Avg", key: "p1Avg", width: 12 },
      { header: "P2 Avg", key: "p2Avg", width: 12 },
      { header: "P3 Avg", key: "p3Avg", width: 12 },
      { header: "P4 Avg", key: "p4Avg", width: 12 },
      { header: "P5 Avg", key: "p5Avg", width: 12 },
      { header: "Overall Rating", key: "overallRating", width: 18 },
      { header: "Final Score", key: "finalScore", width: 14 },
    ];

    // 6. Loop each group
    for (const key in grouped) {
      const groupFeedbacks = grouped[key];

      const subjectId = groupFeedbacks[0].subject.toString();
      const term = groupFeedbacks[0].term;

      const p1Avg = calculateSectionAverage(groupFeedbacks, "parameter1", [
        "q1",
        "q2",
      ]);
      const p2Avg = calculateSectionAverage(groupFeedbacks, "parameter2", [
        "q1",
        "q2",
        "q3",
        "q4",
      ]);
      const p3Avg = calculateSectionAverage(groupFeedbacks, "parameter3", [
        "q1",
        "q2",
        "q3",
        "q4",
      ]);
      const p4Avg = calculateSectionAverage(groupFeedbacks, "parameter4", [
        "q1",
        "q2",
        "q3",
      ]);
      const p5Avg = calculateSectionAverage(groupFeedbacks, "parameter5", [
        "q1",
        "q2",
        "q3",
      ]);

      const overallRating = calculateNumberAverage(
        groupFeedbacks,
        "overallEffectiveness",
      );

      const finalScore = roundToTwo(
        (p1Avg + p2Avg + p3Avg + p4Avg + p5Avg + overallRating) / 6,
      );

      worksheet.addRow({
        faculty: faculty?.name || facultyId,
        subject: subjectMap[subjectId] || subjectId,
        term,
        p1Avg,
        p2Avg,
        p3Avg,
        p4Avg,
        p5Avg,
        overallRating,
        finalScore,
      });
    }

    // Styling
    worksheet.getRow(1).font = { bold: true };

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      });
    });

    // Response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="faculty-report.xlsx"',
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({
      error: "Failed to generate report",
    });
  }
};
