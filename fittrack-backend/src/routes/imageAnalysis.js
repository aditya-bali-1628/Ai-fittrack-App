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

// ─────────────────────────────────────────────
// Helper: call Llama 3.2 11B Vision via OpenRouter
// ─────────────────────────────────────────────
async function callLlamaVision(base64Image, mediaType) {
  const res = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "meta-llama/llama-3.2-11b-vision-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mediaType};base64,${base64Image}`,
              },
            },
            {
              type: "text",
              text: `Analyze this food image.

Return ONLY valid JSON, no markdown, no explanation:
{
  "name": "food name",
  "calories": 350
}

Rules:
- calories is a number (kcal for a typical single serving)
- If the image is not food, return:
{
  "name": null,
  "calories": null
}`,
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 200,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY_2}`,
        "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:3000",
        "X-Title": "Food Calorie Analyzer",
      },
    }
  );

  return res.data?.choices?.[0]?.message?.content || "";
}

// ─────────────────────────────────────────────
// POST /api/image-analysis
// ─────────────────────────────────────────────
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { message: "No image provided" },
      });
    }

    const base64Image = req.file.buffer.toString("base64");
    const mediaType = req.file.mimetype;

    const text = await callLlamaVision(base64Image, mediaType);

    console.log("Llama Vision raw response:", text);

    let result;

    try {
      const clean = text.replace(/```json\n?|```\n?/g, "").trim();
      result = JSON.parse(clean);
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

    if (result.name === null || result.calories === null || !result.name) {
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