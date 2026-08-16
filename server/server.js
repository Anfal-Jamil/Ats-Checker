require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json({ limit: "2mb" }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

app.post("/api/scan", async (req, res) => {
  const { resume, jobDesc } = req.body;

  if (!resume || !jobDesc) {
    return res.status(400).json({ error: "Missing resume or jobDesc" });
  }

  const prompt =
    "You are an ATS (Applicant Tracking System) resume scanner. Compare the RESUME against the JOB DESCRIPTION and respond with ONLY valid JSON, no preamble, no markdown fences, matching exactly this shape:\n" +
    '{"score": <integer 0-100>, "verdict": <"Strong Match"|"Needs Work"|"Weak Match">, "matchedKeywords": [<string, up to 8>], "missingKeywords": [<string, up to 8>], "feedback": [<string, 3 to 5 short actionable bullets>]}\n\n' +
    "RESUME:\n" + resume + "\n\nJOB DESCRIPTION:\n" + jobDesc;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Scan failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));