const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Chat routes
router.post('/send', chatController.sendMessage);
router.get('/messages/:userId', chatController.getMessages);
router.get('/conversations', chatController.getConversations);
router.delete('/messages/:id', chatController.deleteMessage);

module.exports = router;
