const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

// Get all reported posts
exports.getReportedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ isReported: true, isDeleted: false })
      .populate('author', 'username fullName email')
      .sort({ reportCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ isReported: true, isDeleted: false });

    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    logger.error(`Get reported posts failed - ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all reported comments
exports.getReportedComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ isReported: true, isDeleted: false })
      .populate('author', 'username fullName email')
      .populate('post', 'content')
      .sort({ reportCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({ isReported: true, isDeleted: false });

    res.json({
      comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    logger.error(`Get reported comments failed - ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove reported post
exports.removePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isDeleted = true;
    await post.save();

    // Remove from user's posts array
    await User.findByIdAndUpdate(post.author, {
      $pull: { posts: postId }
    });

    logger.info(`Post ${postId} removed by admin: ${req.user.username}`);

    res.json({ message: 'Post removed successfully' });
  } catch (error) {
    logger.error(`Remove post failed - ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove reported comment
exports.removeComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.isDeleted = true;
    await comment.save();

    // Remove from post's comments array
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId }
    });

    logger.info(`Comment ${commentId} removed by admin: ${req.user.username}`);

    res.json({ message: 'Comment removed successfully' });
  } catch (error) {
    logger.error(`Remove comment failed - ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Block user
exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = true;
    await user.save();

    logger.info(`User ${userId} blocked by admin: ${req.user.username}`);

    res.json({ message: 'User blocked successfully', user });
  } catch (error) {
    logger.error(`Block user failed - ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unblock user
exports.unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = false;
    await user.save();

    logger.info(`User ${userId} unblocked by admin: ${req.user.username}`);

    res.json({ message: 'User unblocked successfully', user });
  } catch (error) {
    logger.error(`Unblock user failed - ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, isBlocked } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }
    if (isBlocked !== undefined) {
      query.isBlocked = isBlocked === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    logger.error(`Get all users failed - ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    let startDate = new Date();
    
    // Calculate start date based on period
    switch (period) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Total users
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    // Total posts
    const totalPosts = await Post.countDocuments({ isDeleted: false });
    const newPosts = await Post.countDocuments({ 
      createdAt: { $gte: startDate },
      isDeleted: false 
    });
    const reportedPosts = await Post.countDocuments({ isReported: true, isDeleted: false });

    // Total comments
    const totalComments = await Comment.countDocuments({ isDeleted: false });
    const newComments = await Comment.countDocuments({ 
      createdAt: { $gte: startDate },
      isDeleted: false 
    });
    const reportedComments = await Comment.countDocuments({ isReported: true, isDeleted: false });

    // Engagement metrics
    const postsWithLikes = await Post.countDocuments({ 
      'likes.0': { $exists: true },
      isDeleted: false 
    });
    const totalLikes = await Post.aggregate([
      { $match: { isDeleted: false } },
      { $project: { likesCount: { $size: '$likes' } } },
      { $group: { _id: null, total: { $sum: '$likesCount' } } }
    ]);
    const totalLikesCount = totalLikes[0]?.total || 0;

    // Active users (users who posted in the period)
    const activeUsers = await Post.distinct('author', {
      createdAt: { $gte: startDate },
      isDeleted: false
    });

    res.json({
      period,
      users: {
        total: totalUsers,
        new: newUsers,
        blocked: blockedUsers,
        active: activeUsers.length
      },
      posts: {
        total: totalPosts,
        new: newPosts,
        reported: reportedPosts,
        withLikes: postsWithLikes
      },
      comments: {
        total: totalComments,
        new: newComments,
        reported: reportedComments
      },
      engagement: {
        totalLikes: totalLikesCount,
        averageLikesPerPost: totalPosts > 0 ? (totalLikesCount / totalPosts).toFixed(2) : 0
      }
    });
  } catch (error) {
    logger.error(`Get analytics failed - ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Dismiss report (mark as reviewed)
exports.dismissReport = async (req, res) => {
  try {
    const { type, id } = req.body; // type: 'post' or 'comment'

    if (type === 'post') {
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      post.isReported = false;
      post.reportCount = 0;
      await post.save();
      logger.info(`Post report dismissed by admin: ${req.user.username}`);
    } else if (type === 'comment') {
      const comment = await Comment.findById(id);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      comment.isReported = false;
      comment.reportCount = 0;
      await comment.save();
      logger.info(`Comment report dismissed by admin: ${req.user.username}`);
    } else {
      return res.status(400).json({ message: 'Invalid type. Must be "post" or "comment"' });
    }

    res.json({ message: 'Report dismissed successfully' });
  } catch (error) {
    logger.error(`Dismiss report failed - ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

