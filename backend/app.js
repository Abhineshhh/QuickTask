const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// CORS configuration
const corsOptions = process.env.ALLOWED_ORIGINS
  ? { origin: process.env.ALLOWED_ORIGINS.split(','), credentials: true }
  : { origin: '*' };
app.use(cors(corsOptions));
app.use(express.json());

// API route mounting
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
