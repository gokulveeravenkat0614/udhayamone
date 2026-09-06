const express = require('express');
const auth = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuthMiddleware');
const { chat, history } = require('../controllers/assistantController');

const router = express.Router();

// Public chatbot; signed-in users also get personalized MongoDB context.
router.post('/chat', optionalAuth, chat);

// Only the signed-in user can read their own saved conversations.
router.get('/history', auth, history);

module.exports = router;
