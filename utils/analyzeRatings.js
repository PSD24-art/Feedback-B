function analyzeRatings(ratings) {
  const total = ratings.reduce((sum, r) => sum + r.avgRating, 0);
  const avg = (total / ratings.length).toFixed(2);

  const sorted = [...ratings].sort((a, b) => a.avgRating - b.avgRating);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  // categorize performance level
  let performanceLevel;
  if (avg >= 4.0) performanceLevel = "Excellent";
  else if (avg >= 3.5) performanceLevel = "Good";
  else if (avg >= 3.0) performanceLevel = "Average";
  else performanceLevel = "Needs Improvement";

  return { avg, performanceLevel, weakest, strongest };
}

module.exports = analyzeRatings;
