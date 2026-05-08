const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/auth');
const FoodLog = require('../models/FoodLog');
const ActivityLog = require('../models/ActivityLog');

const router = express.Router();

// ─────────────────────────────────────────────
// Helper: call Gemini
// ─────────────────────────────────────────────
async function callGemini(prompt, jsonMode = true) {
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1000,
      },
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!jsonMode) return text.trim();

  // Strip possible markdown fences
  const clean = text.replace(/```json\n?|```\n?/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    console.error('JSON parse failed. Raw response:', text);
    throw new Error('AI returned invalid JSON');
  }
}

// ─────────────────────────────────────────────
// 1. AI COACH CHAT
// POST /api/ai/chat
// Body: { message: string, history: [{role, content}] }
// ─────────────────────────────────────────────
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const user = req.user;

    // Fetch last 7 days of logs for context
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const [foodLogs, activityLogs] = await Promise.all([
      FoodLog.find({ user: user._id, createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(30),
      ActivityLog.find({ user: user._id, createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(20),
    ]);

    const totalCaloriesToday = foodLogs
      .filter(f => f.createdAt.toISOString().split('T')[0] === new Date().toISOString().split('T')[0])
      .reduce((s, f) => s + f.calories, 0);

    const systemContext = `You are FitCoach, a friendly and knowledgeable AI fitness coach inside the FitTrack app.

USER PROFILE:
- Name: ${user.username}
- Age: ${user.age || 'not set'} years
- Weight: ${user.weight || 'not set'} kg
- Height: ${user.height || 'not set'} cm
- Goal: ${user.goal === 'lose' ? 'Lose Weight' : user.goal === 'gain' ? 'Gain Muscle' : 'Maintain Weight'}
- Daily Calorie Target: ${user.dailyCalorieIntake || 2000} kcal
- Daily Calorie Burn Goal: ${user.dailyCalorieBurn || 400} kcal

TODAY'S STATS:
- Calories consumed today: ${totalCaloriesToday} kcal
- Activities today: ${activityLogs.filter(a => a.createdAt.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]).map(a => `${a.name} (${a.duration}min, ${a.calories}kcal)`).join(', ') || 'None yet'}

RECENT FOOD (last 7 days, latest first):
${foodLogs.slice(0, 10).map(f => `- ${f.name}: ${f.calories}kcal (${f.mealType})`).join('\n')}

RECENT ACTIVITIES (last 7 days):
${activityLogs.slice(0, 8).map(a => `- ${a.name}: ${a.duration}min, ${a.calories}kcal`).join('\n')}

RULES:
- Be warm, motivating, and concise (2-4 sentences max per reply unless explaining something detailed)
- Give specific, actionable advice based on their actual data above
- Never make up medical diagnoses; recommend consulting a doctor for medical issues
- If they ask about logging food or activities, remind them they can do it in the app`;

    // Build conversation for Gemini
    const conversationHistory = history.slice(-10); // Keep last 10 turns
    const fullPrompt = `${systemContext}

CONVERSATION HISTORY:
${conversationHistory.map(h => `${h.role === 'user' ? 'User' : 'FitCoach'}: ${h.content}`).join('\n')}

User: ${message}
FitCoach:`;

    const reply = await callGemini(fullPrompt, false);

    res.json({ reply });
  } catch (error) {
    console.error('AI Chat error:', error?.response?.data || error.message);
    res.status(500).json({ error: { message: 'AI Coach is unavailable right now. Please try again.' } });
  }
});

// ─────────────────────────────────────────────
// 2. AI SMART CALORIE ESTIMATOR
// POST /api/ai/estimate-calories
// Body: { foodName: string }
// ─────────────────────────────────────────────
router.post('/estimate-calories', protect, async (req, res) => {
  try {
    const { foodName } = req.body;
    if (!foodName || !foodName.trim()) {
      return res.status(400).json({ error: { message: 'foodName is required' } });
    }

    const prompt = `Estimate the calories for this food item. Return ONLY valid JSON, no markdown.

Food: "${foodName.trim()}"

Return:
{
  "name": "standardized food name",
  "calories": 350,
  "serving": "1 medium plate (250g)",
  "confidence": "high",
  "breakdown": {
    "protein": 28,
    "carbs": 45,
    "fat": 12
  },
  "tips": "A short tip about this food (max 1 sentence)"
}

Rules:
- calories must be a number (kcal for a typical single serving)
- confidence is "high", "medium", or "low"
- protein/carbs/fat are in grams
- If you truly cannot identify the food, set calories to null`;

    const result = await callGemini(prompt);

    if (!result || result.calories === null) {
      return res.status(422).json({ error: { message: 'Could not estimate calories for this food. Try being more specific.' } });
    }

    res.json({ result });
  } catch (error) {
    console.error('Calorie estimate error:', error?.response?.data || error.message);
    res.status(500).json({ error: { message: 'Could not estimate calories right now.' } });
  }
});

// ─────────────────────────────────────────────
// 3. AI DAILY INSIGHTS
// GET /api/ai/daily-insight
// ─────────────────────────────────────────────
router.get('/daily-insight', protect, async (req, res) => {
  try {
    const user = req.user;
    const today = new Date().toISOString().split('T')[0];

    const [foodLogs, activityLogs] = await Promise.all([
      FoodLog.find({ user: user._id }),
      ActivityLog.find({ user: user._id }),
    ]);

    const todayFood = foodLogs.filter(f => f.createdAt.toISOString().split('T')[0] === today);
    const todayActivity = activityLogs.filter(a => a.createdAt.toISOString().split('T')[0] === today);

    const totalCaloriesToday = todayFood.reduce((s, f) => s + f.calories, 0);
    const totalBurnedToday = todayActivity.reduce((s, a) => s + a.calories, 0);

    // Weekly averages
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekFood = foodLogs.filter(f => f.createdAt >= weekAgo);
    const weekActivity = activityLogs.filter(a => a.createdAt >= weekAgo);
    const avgDailyCalories = weekFood.length > 0
      ? Math.round(weekFood.reduce((s, f) => s + f.calories, 0) / 7)
      : 0;

    const prompt = `You are a fitness AI generating a personalized daily insight for a FitTrack user.

USER: ${user.username}, Goal: ${user.goal === 'lose' ? 'lose weight' : user.goal === 'gain' ? 'gain muscle' : 'maintain weight'}
Daily calorie target: ${user.dailyCalorieIntake || 2000} kcal, Burn goal: ${user.dailyCalorieBurn || 400} kcal

TODAY SO FAR:
- Calories consumed: ${totalCaloriesToday} kcal
- Calories burned: ${totalBurnedToday} kcal
- Meals: ${todayFood.map(f => f.name).join(', ') || 'None yet'}
- Activities: ${todayActivity.map(a => `${a.name} (${a.duration}min)`).join(', ') || 'None yet'}

7-DAY AVERAGES:
- Avg daily calories: ${avgDailyCalories} kcal
- Activities this week: ${weekActivity.length}

Generate a short personalized insight. Return ONLY valid JSON:
{
  "insight": "A 1-2 sentence personalized tip or observation based on their actual data",
  "type": "success | warning | tip | motivation",
  "emoji": "a relevant emoji"
}

Rules:
- insight must reference their actual data (specific numbers or food/activity names if available)
- type: "success" if on track, "warning" if going over/under targets, "tip" for actionable advice, "motivation" if no data yet
- Be specific, warm, and actionable`;

    const result = await callGemini(prompt);
    res.json({ result });
  } catch (error) {
    console.error('Daily insight error:', error?.response?.data || error.message);
    res.status(500).json({ error: { message: 'Could not generate insight right now.' } });
  }
});

// ─────────────────────────────────────────────
// 4. AI WORKOUT RECOMMENDER
// GET /api/ai/workout-recommendations
// ─────────────────────────────────────────────
router.get('/workout-recommendations', protect, async (req, res) => {
  try {
    const user = req.user;

    // Get last 14 days of activity
    const since = new Date();
    since.setDate(since.getDate() - 14);
    const recentActivities = await ActivityLog.find({
      user: user._id,
      createdAt: { $gte: since },
    }).sort({ createdAt: -1 });

    const activityNames = [...new Set(recentActivities.map(a => a.name))];
    const totalMinutes = recentActivities.reduce((s, a) => s + a.duration, 0);
    const avgDailyMinutes = Math.round(totalMinutes / 14);

    const prompt = `You are a fitness AI recommending personalized workouts for a FitTrack user.

USER PROFILE:
- Age: ${user.age || 'not specified'}
- Weight: ${user.weight || 'not specified'} kg
- Goal: ${user.goal === 'lose' ? 'Lose Weight' : user.goal === 'gain' ? 'Gain Muscle' : 'Maintain Weight'}
- Daily calorie burn goal: ${user.dailyCalorieBurn || 400} kcal

RECENT ACTIVITY (last 14 days):
- Activities done: ${activityNames.join(', ') || 'None'}
- Avg daily active minutes: ${avgDailyMinutes} min
- Total sessions: ${recentActivities.length}

Return ONLY valid JSON with 3 workout recommendations tailored to their goal and history:
{
  "recommendations": [
    {
      "name": "Workout name",
      "duration": 30,
      "estimatedCalories": 250,
      "intensity": "low | medium | high",
      "description": "1-2 sentence description of why this workout suits them",
      "exercises": ["Exercise 1", "Exercise 2", "Exercise 3", "Exercise 4"],
      "emoji": "relevant emoji"
    }
  ],
  "weeklyPlan": "A 1-sentence suggestion for how to structure their week"
}

Rules:
- Tailor recommendations to their specific goal
- If they've been inactive, start with low intensity
- Vary workout types (cardio, strength, flexibility)
- estimatedCalories should match duration and intensity realistically`;

    const result = await callGemini(prompt);
    res.json({ result });
  } catch (error) {
    console.error('Workout recommendation error:', error?.response?.data || error.message);
    res.status(500).json({ error: { message: 'Could not generate recommendations right now.' } });
  }
});

module.exports = router;
