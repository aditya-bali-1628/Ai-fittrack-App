const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const formatUser = (user) => ({
  id: user._id.toString(),
  documentId: user._id.toString(),
  username: user.username,
  email: user.email,
  age: user.age,
  weight: user.weight,
  height: user.height,
  goal: user.goal,
  dailyCalorieIntake: user.dailyCalorieIntake,
  dailyCalorieBurn: user.dailyCalorieBurn,
  createdAt: user.createdAt,
});

// GET /api/users/me
router.get('/me', protect, async (req, res) => {
  try {
    res.json(formatUser(req.user));
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// PUT /api/users/:id  — update profile (onboarding + profile edit)
router.put('/:id', protect, async (req, res) => {
  try {
    const { age, weight, height, goal, dailyCalorieIntake, dailyCalorieBurn } = req.body;

    // Only allow updating own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: { message: 'Not authorized' } });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { age, weight, height, goal, dailyCalorieIntake, dailyCalorieBurn },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(formatUser(updated));
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

module.exports = router;
