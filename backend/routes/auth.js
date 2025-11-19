const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { uploadFields } = require('../utils/upload');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, uploadFields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'coverPicture', maxCount: 1 }
]), authController.updateProfile);

module.exports = router;
