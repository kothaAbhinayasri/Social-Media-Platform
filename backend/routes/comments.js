const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Comment CRUD
router.post('/', commentController.addComment);
router.get('/post/:postId', commentController.getComments);
router.put('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);

// Comment interactions
router.post('/:id/like', commentController.likeComment);
router.post('/:id/report', commentController.reportComment);

module.exports = router;
