const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

const router = express.Router();

const formatEntry = (entry) => ({
  id: entry._id.toString(),
  documentId: entry._id.toString(),
  name: entry.name,
  duration: entry.duration,
  calories: entry.calories,
  createdAt: entry.createdAt,
});

// GET /api/activity-logs  — get all activity logs for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const logs = await ActivityLog.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(logs.map(formatEntry));
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// POST /api/activity-logs  — create an activity log entry
// Frontend sends: { data: { name, duration, calories } }
router.post('/', protect, async (req, res) => {
  try {
    const { name, duration, calories } = req.body.data || req.body;

    if (!name || !duration) {
      return res.status(400).json({ error: { message: 'name and duration are required' } });
    }

    const entry = await ActivityLog.create({
      user: req.user._id,
      name,
      duration,
      calories: calories || 0,
    });

    res.status(201).json(formatEntry(entry));
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// DELETE /api/activity-logs/:documentId
router.delete('/:documentId', protect, async (req, res) => {
  try {
    const entry = await ActivityLog.findById(req.params.documentId);

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
