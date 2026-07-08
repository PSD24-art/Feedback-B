exports.getFacultyAiSummary = async (req, res) => {
  console.log("Route hit");
  try {
    const { facultyName, criteriaAnalysis, subjectAnalysis } = req.body;

    const prompt = `
You are an AI evaluator assessing a faculty member based on feedback data.

Faculty Name: ${facultyName}

Criteria Analysis:
Average Rating: ${criteriaAnalysis.avg} (${criteriaAnalysis.performanceLevel})
Strongest Area: ${criteriaAnalysis.strongest.criteria}
Weakest Area: ${criteriaAnalysis.weakest.criteria}

Subject Analysis:
Average Rating: ${subjectAnalysis.avg} (${subjectAnalysis.performanceLevel})
Best Subject: ${subjectAnalysis.strongest.subjectName}
Weakest Subject: ${subjectAnalysis.weakest.subjectName}

TASK:
Return ONLY valid JSON in the following structure.

{
  "points": [
    {
      "title": "string",
      "type": "strength | improvement | overall",
      "description": "qualitative explanation without numbers"
    }
  ]
}

Rules:
- Write 4–6 points
- Each point must be independent (can be shown as a separate card)
- Avoid numbers completely
- Use professional, constructive language
- End with ONE overall remark with type = "overall"
- Do not include any extra text outside JSON
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 600,
        }),
      },
    );

    const data = await response.json();

    if (data.error) {
      console.error("AI API Error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const content = data.choices[0].message.content;

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error("Invalid JSON from AI:", content);
    }

    if (!parsed || !Array.isArray(parsed.points)) {
      console.error("Invalid AI JSON:", content);
      return res.status(500).json({
        error: "AI returned invalid structured data",
        points: [],
      });
    }

    res.json({ points: parsed.points });
  } catch (error) {
    console.error("AI Summary Error:", error);
    res.status(500).json({ error: "AI summarization failed." });
  }
};
