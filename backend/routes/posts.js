const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { auth } = require('../middleware/auth');
const uploadUtils = require('../utils/upload');

// All routes require authentication
router.use(auth);

// Post CRUD
router.post('/', uploadUtils.uploadMultiple('media', 10), postController.createPost);
router.get('/', postController.getPosts);
router.get('/:id', postController.getPostById);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

// Post interactions
router.post('/:id/like', postController.likePost);
router.post('/:id/share', postController.sharePost);
router.post('/:id/report', postController.reportPost);

module.exports = router;
