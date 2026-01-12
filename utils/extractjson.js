function extractJSON(text) {
  if (!text || typeof text !== "string") return null;

  // 1️⃣ Remove ALL markdown code fences (```json, ```JSON, ``` )
  text = text.replace(/```[\s\S]*?\n/g, "");
  text = text.replace(/```/g, "").trim();

  // 2️⃣ Extract JSON object safely
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) return null;

  const jsonString = text.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("JSON parse failed:", jsonString);
    return null;
  }
}

module.exports = { extractJSON };
