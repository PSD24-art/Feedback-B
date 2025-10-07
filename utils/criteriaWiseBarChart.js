const criteriWiseCharts = (feedbacks) => {
  // If no feedbacks, return 0 immediately
  if (!feedbacks || feedbacks.length === 0) return 0;

  // Helper to safely average values (skips undefined/null)
  const safeAverage = (values) => {
    const valid = values.filter((v) => typeof v === "number" && !isNaN(v));
    if (valid.length === 0) return 0;
    return valid.reduce((a, b) => a + b, 0) / valid.length;
  };

  const p1Arr = [];
  const p2Arr = [];
  const p3Arr = [];
  const p4Arr = [];
  const p5Arr = [];

  for (const feedback of feedbacks) {
    if (!feedback) continue;

    const p1 = safeAverage([feedback.parameter1?.q1, feedback.parameter1?.q2]);
    const p2 = safeAverage([
      feedback.parameter2?.q1,
      feedback.parameter2?.q2,
      feedback.parameter2?.q3,
      feedback.parameter2?.q4,
    ]);
    const p3 = safeAverage([
      feedback.parameter3?.q1,
      feedback.parameter3?.q2,
      feedback.parameter3?.q3,
    ]);
    const p4 = safeAverage([
      feedback.parameter4?.q1,
      feedback.parameter4?.q2,
      feedback.parameter4?.q3,
    ]);
    const p5 = safeAverage([
      feedback.parameter5?.q1,
      feedback.parameter5?.q2,
      feedback.parameter5?.q3,
    ]);

    p1Arr.push(p1);
    p2Arr.push(p2);
    p3Arr.push(p3);
    p4Arr.push(p4);
    p5Arr.push(p5);
  }

  // Average each parameter across all feedbacks
  const avgParam1 = safeAverage(p1Arr);
  const avgParam2 = safeAverage(p2Arr);
  const avgParam3 = safeAverage(p3Arr);
  const avgParam4 = safeAverage(p4Arr);
  const avgParam5 = safeAverage(p5Arr);

  console.log("avgParam1", avgParam1);
  console.log("avgParam2", avgParam2);
  console.log("avgParam3", avgParam3);
  console.log("avgParam4", avgParam4);
  console.log("avgParam5", avgParam5);

  const criteriArr = [
    Number(avgParam1).toFixed(2),
    Number(avgParam2).toFixed(2),
    Number(avgParam3).toFixed(2),
    Number(avgParam4).toFixed(2),
    Number(avgParam5).toFixed(2),
  ];
  console.log(criteriArr);

  return criteriArr;
};

module.exports = criteriWiseCharts;
