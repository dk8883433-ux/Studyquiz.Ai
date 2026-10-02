const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

 app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile("Index.html", { root: __dirname });
});
app.post("/api/topics", async (req, res) => {
  try {
    const { subject } = req.body;

    if (!subject) {
      return res.status(400).json({
        error: "Book or topic name is required"
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured"
      });
    }

    const prompt = `
You are an educational content organizer.

The user entered:
"${subject}"

Understand what the user is referring to.

If it is a book, class, subject, course, exam, programming language,
or any educational topic, create a useful list of chapters/topics
that a student can select for a quiz.

Return ONLY valid JSON.

Format:
{
  "title": "Name understood from user input",
  "type": "chapters",
  "items": [
    {
      "number": 1,
      "name": "Chapter or Topic name"
    }
  ]
}

Rules:
- Create 5 to 20 relevant items.
- Use accurate and commonly recognized chapter/topic names when possible.
- If the input is a book, give its chapters.
- If the input is a subject/course, give major topics.
- If the input is an exam, give useful preparation topics.
- If the input is programming, give programming topics.
- Keep names short and clear.
- Do not add markdown.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" +
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
      console.error("Gemini Topics Error:", data);

      return res.status(response.status).json({
        error: data.error?.message || "Gemini API error"
      });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: "AI response empty"
      });
    }

    const topics = JSON.parse(text);

    res.json(topics);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Topic generation failed"
    });
  }
});
// ================================
// SMART TOPIC / CHAPTER GENERATOR
// ================================

app.post("/api/quiz", async (req, res) => {

  try {
    const { topic } = req.body;

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
You are an educational assistant.

The user entered:
"${topic}"

Generate useful related chapters, topics, or subtopics based on exactly what the user entered.

If the user enters a book name, suggest its chapters.
If the user enters a subject, suggest its important topics.
If the user enters a general topic, suggest related subtopics.

Return ONLY valid JSON.

Format:
{
  "topics": [
    "Topic 1",
    "Topic 2",
    "Topic 3",
    "Topic 4",
    "Topic 5"
  ]
}

Give 5 to 15 useful suggestions.
Do not add markdown.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" +
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
      console.error("Gemini Topic Error:", data);

      return res.status(response.status).json({
        error: data.error?.message || "Gemini API error"
      });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: "AI response empty"
      });
    }

    const result = JSON.parse(text);

    res.json(result);

  } catch (error) {

    console.error("Topic generation error:", error);

    res.status(500).json({
      error: "Topic generation failed"
    });

  }

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
       "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" +
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
  console.error("Gemini API Error:", data);

  return res.status(response.status).json({
    error: data.error?.message || "Gemini API error"
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
