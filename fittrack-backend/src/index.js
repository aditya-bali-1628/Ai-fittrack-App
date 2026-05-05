require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const foodLogRoutes = require('./routes/foodLogs');
const activityLogRoutes = require('./routes/activityLogs');
const imageAnalysisRoutes = require('./routes/imageAnalysis');

const path = require("path")

const app = express();
const _dirname = path.resolve();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes  (matching exact paths the frontend uses)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/food-logs', foodLogRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/image-analysis', imageAnalysisRoutes);

app.use(express.static(path.join(_dirname, "Frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(_dirname, "Frontend", "dist", "index.html"));
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404
app.use((req, res) => res.status(404).json({ error: { message: 'Route not found' } }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: { message: err.message || 'Internal server error' } });
});

const PORT = process.env.PORT || 1337;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
