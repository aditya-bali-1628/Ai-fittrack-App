const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Format user response to match what frontend expects
const formatUser = (user, token) => ({
  jwt: token,
  user: {
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
  },
});

// POST /api/auth/local/register
router.post('/local/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: { message: 'All fields are required' } });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: { message: 'Email already in use' } });
    }

    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);

    res.status(201).json(formatUser(user, token));
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// POST /api/auth/local  (login)
router.post('/local', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({ email: identifier });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: { message: 'Invalid email or password' } });
    }

    const token = generateToken(user._id);
    res.json(formatUser(user, token));
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

module.exports = router;
