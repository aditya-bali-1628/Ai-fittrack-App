const express = require("express");
const multer = require("multer");
const axios = require("axios");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Store image in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// POST /api/image-analysis
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { message: "No image provided" },
      });
    }

    const base64Image = req.file.buffer.toString("base64");
    const mediaType = req.file.mimetype;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mediaType,
                  data: base64Image,
                },
              },
              {
                text: `
Analyze this food image.

Return ONLY valid JSON:
{
  "name": "food name",
  "calories": 350
}

Rules:
- No markdown
- No explanation
- Single food serving estimate
- If not food:

{
  "name": null,
  "calories": null
}
                `,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500,
          responseMimeType: "application/json",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("Gemini raw response:", text);

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      try {
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("No JSON found");
        result = JSON.parse(match[0]);
      } catch (err) {
        console.error("JSON parse failed:", err.message);
        return res.status(422).json({
          error: { message: "Could not parse food from image" },
        });
      }
    }

    if (
      result.name === null ||
      result.calories === null ||
      !result.name
    ) {
      return res.status(422).json({
        error: { message: "No food detected in image" },
      });
    }

    res.json({ result });
  } catch (error) {
    console.error(
      "Image analysis error:",
      error?.response?.data || error.message
    );

    res.status(500).json({
      error: {
        message:
          error?.response?.data?.error?.message ||
          error.message ||
          "Image analysis failed",
      },
    });
  }
});

module.exports = router;