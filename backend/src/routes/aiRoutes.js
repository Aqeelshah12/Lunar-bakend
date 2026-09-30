/**
 * AI Routes
 * Endpoints for Lunar Mission Assistant (Groq-powered):
 * POST /api/ai/chat
 */
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/chat', aiController.handleChat);

module.exports = router;
