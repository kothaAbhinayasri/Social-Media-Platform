const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// User profile and interactions
router.get('/profile/:id', userController.getUserProfile);
router.post('/follow/:id', userController.followUser);
router.get('/followers/:id', userController.getFollowers);
router.get('/following/:id', userController.getFollowing);

// Search and feed
router.get('/search', userController.searchUsers);
router.get('/feed', userController.getFeed);

module.exports = router;
