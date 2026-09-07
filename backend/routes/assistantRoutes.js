const express = require('express');
const auth = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuthMiddleware');
const { chat, history, config, health, diagnostic } = require('../controllers/assistantController');

const router = express.Router();

// Temporary diagnostic endpoint to test OpenAI connectivity and retrieve real error statuses safely
router.get('/diagnostic', diagnostic);

// AI health check endpoint (returns success, aiConfigured, providerReachable without leaking secrets)
router.get('/health', health);

// Configuration status (indicates whether OpenAI is configured without leaking secret key)
router.get('/config', config);

// Public chatbot; signed-in users also get personalized MongoDB context.
router.post('/chat', optionalAuth, chat);

// Only the signed-in user can read their own saved conversations.
router.get('/history', auth, history);

module.exports = router;
