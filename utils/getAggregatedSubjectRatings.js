const mongoose = require("mongoose");
const Feedback = require("../models/feedback");

const getAggregatedSubjectRatings = async (facultyId, subjectIds, term) => {
  // Build dynamic match filter based on the term
  const matchStage = {
    faculty: new mongoose.Types.ObjectId(facultyId),
    subject: { $in: subjectIds },
  };

  if (term !== "ALL") {
    matchStage.term = term;
  }

  const aggregatedRatings = await Feedback.aggregate([
    { $match: matchStage },
    {
      $project: {
        subject: 1,
        p1Avg: { $avg: ["$parameter1.q1", "$parameter1.q2"] },
        p2Avg: {
          $avg: [
            "$parameter2.q1",
            "$parameter2.q2",
            "$parameter2.q3",
            "$parameter2.q4",
          ],
        },
        p3Avg: {
          $avg: [
            "$parameter3.q1",
            "$parameter3.q2",
            "$parameter3.q3",
            "$parameter3.q4",
          ],
        },
        p4Avg: { $avg: ["$parameter4.q1", "$parameter4.q2", "$parameter4.q3"] },
        p5Avg: { $avg: ["$parameter5.q1", "$parameter5.q2", "$parameter5.q3"] },
      },
    },
    {
      $group: {
        _id: "$subject",
        totalAvgP1: { $avg: "$p1Avg" },
        totalAvgP2: { $avg: "$p2Avg" },
        totalAvgP3: { $avg: "$p3Avg" },
        totalAvgP4: { $avg: "$p4Avg" },
        totalAvgP5: { $avg: "$p5Avg" },
      },
    },
    {
      $project: {
        _id: 1,
        subjectAvg: {
          $round: [
            {
              $avg: [
                "$totalAvgP1",
                "$totalAvgP2",
                "$totalAvgP3",
                "$totalAvgP4",
                "$totalAvgP5",
              ],
            },
            2,
          ],
        },
      },
    },
  ]);

  return new Map(
    aggregatedRatings.map((item) => [item._id.toString(), item.subjectAvg]),
  );
};

module.exports = { getAggregatedSubjectRatings };
