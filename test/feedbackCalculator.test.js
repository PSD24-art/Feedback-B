const feedbackCalculator = require("../utils/feedbackCalculator");

describe("feedbackCalculator", () => {
  test("returns 0 if no feedbacks", () => {
    expect(feedbackCalculator([])).toBe(0);
    expect(feedbackCalculator(null)).toBe(0);
  });

  test("calculates correct overall average", () => {
    const feedbacks = [
      {
        parameter1: { q1: 4, q2: 4 },
        parameter2: { q1: 5, q2: 5, q3: 5, q4: 5 },
        parameter3: { q1: 3, q2: 3, q3: 3 },
        parameter4: { q1: 4, q2: 4, q3: 4 },
        parameter5: { q1: 5, q2: 5, q3: 5 },
      },
    ];

    expect(feedbackCalculator(feedbacks)).toBe(4.2);
  });

  test("ignores undefined values safely", () => {
    const feedbacks = [
      {
        parameter1: { q1: 4 },
        parameter2: {},
        parameter3: null,
        parameter4: undefined,
        parameter5: { q1: 5 },
      },
    ];

    const result = feedbackCalculator(feedbacks);
    expect(result).toBeGreaterThanOrEqual(0);
  });
});
