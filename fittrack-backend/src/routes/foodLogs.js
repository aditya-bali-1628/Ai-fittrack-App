const express = require('express');
const FoodLog = require('../models/FoodLog');
const { protect } = require('../middleware/auth');

const router = express.Router();

const formatEntry = (entry) => ({
  id: entry._id.toString(),
  documentId: entry._id.toString(),
  name: entry.name,
  calories: entry.calories,
  mealType: entry.mealType,
  createdAt: entry.createdAt,
});

// GET /api/food-logs  — get all food logs for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const logs = await FoodLog.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(logs.map(formatEntry));
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// POST /api/food-logs  — create a food log entry
// Frontend sends: { data: { name, calories, mealType } }
router.post('/', protect, async (req, res) => {
  try {
    const { name, calories, mealType } = req.body.data || req.body;

    if (!name || !calories || !mealType) {
      return res.status(400).json({ error: { message: 'name, calories and mealType are required' } });
    }

    const entry = await FoodLog.create({ user: req.user._id, name, calories, mealType });
    res.status(201).json(formatEntry(entry));
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// DELETE /api/food-logs/:documentId
router.delete('/:documentId', protect, async (req, res) => {
  try {
    const entry = await FoodLog.findById(req.params.documentId);

    if (!entry) {
      return res.status(404).json({ error: { message: 'Entry not found' } });
    }

    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: { message: 'Not authorized' } });
    }

    await entry.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

module.exports = router;
