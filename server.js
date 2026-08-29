import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "StudyQuiz AI Server is running 🚀"
  });
});

app.post("/api/quiz", async (req, res) => {

  try {

    const {
      topic,
      count = 10,
      difficulty = "Medium",
      language = "Hindi"
    } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: "Topic is required"
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured"
      });
    }

    const prompt = `
You are an educational quiz generator.

Create ${count} multiple-choice questions about:
"${topic}"

Difficulty: ${difficulty}
Language: ${language}

Return ONLY valid JSON.

Format:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": 0,
      "explanation": "Short explanation"
    }
  ]
}

Rules:
- answer must be the correct option's index: 0, 1, 2 or 3.
- Make every question different.
- Keep explanations short and useful.
- Do not add markdown.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      encodeURIComponent(process.env.GEMINI_API_KEY),
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],

          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return res.status(500).json({
        error: "Gemini API error"
      });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: "AI response empty"
      });
    }

    const quiz = JSON.parse(text);

    res.json(quiz);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Quiz generation failed"
    });

  }

});


const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `StudyQuiz AI server running on port ${PORT}`
  );

});
