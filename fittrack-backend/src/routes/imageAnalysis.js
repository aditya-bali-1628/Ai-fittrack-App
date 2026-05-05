const express = require('express');
const multer = require('multer');
const axios = require('axios');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Store image in memory (no disk write needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// POST /api/image-analysis
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No image provided' } });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mediaType = req.file.mimetype;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
                text: `You are a food calorie estimator. Look at this image and identify the food.
Respond ONLY with a raw JSON object — no markdown, no backticks, no explanation.
Use exactly this format:
{"name": "food name here", "calories": 350}
If you cannot identify food in the image, respond with:
{"name": null, "calories": null}`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.1,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Gemini raw response:', text);

    let result;
    try {
      // Extract JSON object from anywhere in the text (handles extra text/markdown)
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) throw new Error('No JSON object found in response');
      result = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('JSON parse failed:', e.message, '| Raw:', text);
      return res.status(422).json({ error: { message: 'Could not parse food from image' } });
    }

    if (!result.name || !result.calories) {
      return res.status(422).json({ error: { message: 'No food detected in image' } });
    }

    res.json({ result });
  } catch (error) {
    console.error('Image analysis error:', error?.response?.data || error.message);
    res.status(500).json({
      error: {
        message: error?.response?.data?.error?.message || error.message || 'Image analysis failed',
      },
    });
  }
});

module.exports = router;