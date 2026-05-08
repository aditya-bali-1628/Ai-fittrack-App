require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const foodLogRoutes = require('./routes/foodLogs');
const activityLogRoutes = require('./routes/activityLogs');
const imageAnalysisRoutes = require('./routes/imageAnalysis');
const aiRoutes = require('./routes/ai');

const path = require("path");

const app = express();

connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── API Routes ────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/food-logs', foodLogRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/image-analysis', imageAnalysisRoutes);
app.use('/api/ai', aiRoutes);

// ── Health check ──────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Global error handler ──────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: { message: err.message || 'Internal server error' } });
});

// ── Serve frontend LAST ───────────────────────
app.use(express.static(path.join(__dirname, '../../Frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../Frontend/dist/index.html'));
});

const PORT = process.env.PORT || 1337;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));