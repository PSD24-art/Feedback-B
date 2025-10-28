const percentageForPie = (feedbackData) => {
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  feedbackData.forEach((feedback) => {
    let allRatings = [];

    // Collect all ratings from parameter1 to parameter5
    for (let i = 1; i <= 5; i++) {
      const param = feedback[`parameter${i}`];
      if (param) {
        allRatings.push(...Object.values(param)); // get all q1, q2, q3 ratings
      }
    }

    // Include overall effectiveness if you want to
    if (feedback.overallEffectiveness) {
      allRatings.push(feedback.overallEffectiveness);
    }

    // Calculate the average rating for this feedback
    const avg = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;

    // Round to nearest whole number (1–5)
    const rounded = Math.round(avg);

    // Increase count for that rating
    ratingCounts[rounded]++;
  });

  // Convert counts to percentage
  const total = Object.values(ratingCounts).reduce((a, b) => a + b, 0);
  const ratingPercentages = {};
  for (let r = 1; r <= 5; r++) {
    ratingPercentages[r] = total
      ? ((ratingCounts[r] / total) * 100).toFixed(1)
      : 0;
  }

  return { ratingCounts, ratingPercentages };
};

module.exports = percentageForPie;
