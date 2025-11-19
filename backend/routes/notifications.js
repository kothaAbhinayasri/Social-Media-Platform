const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/', notificationController.getNotifications);
router.put('/:notificationId/read', notificationController.markAsRead);
router.put('/all/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;

