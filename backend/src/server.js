/**
 * Lunar Mission Hub - Express Backend Server
 * Provides REST API for missions, registrations, and Groq AI Lunar Assistant
 */
require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

// Route handlers
const missionRoutes = require('./routes/missionRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.BACKEND_PORT || (process.env.PORT && process.env.PORT !== '8080' ? process.env.PORT : 5000);

// CORS configuration
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    if (origin === allowedOrigin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.endsWith('.run.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Dev-friendly permissive in development preview
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Health / Root check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Lunar Mission Hub API is running'
  });
});

// REST API routes
app.use('/api/missions', missionRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    error: message
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Lunar Mission Hub API listening on port ${PORT}`);
    console.log(`Ready for requests at http://localhost:${PORT}`);
  });
}

module.exports = app;
