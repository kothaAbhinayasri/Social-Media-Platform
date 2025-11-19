const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

// All routes require authentication and admin access
router.use(auth);
router.use(adminAuth);

// Reported content
router.get('/reported/posts', adminController.getReportedPosts);
router.get('/reported/comments', adminController.getReportedComments);

// Moderation actions
router.delete('/posts/:postId', adminController.removePost);
router.delete('/comments/:commentId', adminController.removeComment);
router.post('/users/:userId/block', adminController.blockUser);
router.post('/users/:userId/unblock', adminController.unblockUser);
router.post('/dismiss-report', adminController.dismissReport);

// User management
router.get('/users', adminController.getAllUsers);

// Analytics
router.get('/analytics', adminController.getAnalytics);

module.exports = router;

