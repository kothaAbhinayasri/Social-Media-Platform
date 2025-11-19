const Notification = require('../models/Notification');
const logger = require('../utils/logger');

exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: req.user._id })
      .populate('from', 'username fullName profilePicture')
      .populate('post', 'content images')
      .populate('comment', 'content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    const totalNotifications = await Notification.countDocuments({
      user: req.user._id
    });

    res.json({
      notifications,
      unreadCount,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalNotifications / limit),
        totalNotifications,
        hasNext: page * limit < totalNotifications,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    logger.error(`Get notifications failed for user: ${req.user.username} - ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (notificationId === 'all') {
      await Notification.updateMany(
        { user: req.user._id, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      logger.info(`All notifications marked as read for user: ${req.user.username}`);
      return res.json({ message: 'All notifications marked as read' });
    }

    const notification = await Notification.findOne({
      _id: notificationId,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    logger.info(`Notification ${notificationId} marked as read for user: ${req.user.username}`);

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    logger.error(`Mark notification as read failed for user: ${req.user.username} - ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.deleteOne();

    logger.info(`Notification ${req.params.id} deleted by user: ${req.user.username}`);

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    logger.error(`Delete notification failed for user: ${req.user.username} - ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to create notification
exports.createNotification = async (user, type, from, content, options = {}) => {
  try {
    // Don't create notification if user is notifying themselves
    if (user.toString() === from.toString()) {
      return null;
    }

    const notification = new Notification({
      user,
      type,
      from,
      content,
      post: options.post || null,
      comment: options.comment || null,
      message: options.message || null
    });

    await notification.save();
    return notification;
  } catch (error) {
    logger.error(`Create notification failed: ${error.message}`);
    return null;
  }
};

