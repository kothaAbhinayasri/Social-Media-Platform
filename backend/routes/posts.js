const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Post CRUD
router.post('/', postController.createPost);
router.get('/', postController.getPosts);
router.get('/:id', postController.getPostById);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

// Post interactions
router.post('/:id/like', postController.likePost);
router.post('/:id/share', postController.sharePost);

module.exports = router;
