const Comment = require('../models/Comment');
const Post = require('../models/Post');
const logger = require('../utils/logger');
const notificationController = require('./notificationController');

exports.addComment = async (req, res) => {
  try {
    const { postId, content, parentCommentId } = req.body;

    logger.info(`Adding comment to post: ${postId} by user: ${req.user.username}`);

    const post = await Post.findById(postId).populate('author', '_id');
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      post: postId,
      author: req.user._id,
      content,
      parentComment: parentCommentId || null
    });

    await comment.save();

    // Add comment to post's comments array
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id }
    });

    // If it's a reply, add to parent comment's replies and notify parent comment author
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId).populate('author', '_id');
      if (parentComment && parentComment.author._id.toString() !== req.user._id.toString()) {
        await Comment.findByIdAndUpdate(parentCommentId, {
          $push: { replies: comment._id }
        });
        // Notify parent comment author
        await notificationController.createNotification(
          parentComment.author._id,
          'comment',
          req.user._id,
          `${req.user.username} replied to your comment`,
          { post: postId, comment: comment._id }
        );
      }
    } else {
      // Notify post author about new comment
      if (post.author._id.toString() !== req.user._id.toString()) {
        await notificationController.createNotification(
          post.author._id,
          'comment',
          req.user._id,
          `${req.user.username} commented on your post`,
          { post: postId, comment: comment._id }
        );
      }
    }

    await comment.populate('author', 'username fullName profilePicture');

    logger.info(`Comment added successfully: ${comment._id}`);

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    logger.error(`Comment addition failed for user: ${req.user.username} - ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({
      post: postId,
      parentComment: null, // Only top-level comments
      isDeleted: false
    })
      .populate('author', 'username fullName profilePicture')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username fullName profilePicture'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalComments = await Comment.countDocuments({
      post: postId,
      parentComment: null,
      isDeleted: false
    });

    res.json({
      comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalComments / limit),
        totalComments,
        hasNext: page * limit < totalComments,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    const comment = await Comment.findOne({
      _id: req.params.id,
      author: req.user._id,
      isDeleted: false
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.content = content;
    await comment.save();
    await comment.populate('author', 'username fullName profilePicture');

    res.json({
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
      author: req.user._id,
      isDeleted: false
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.isDeleted = true;
    await comment.save();

    // Remove comment from post's comments array
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id }
    });

    // If it's a reply, remove from parent comment's replies
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id }
      });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('author', '_id');

    if (!comment || comment.isDeleted) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const existingLike = comment.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      // Unlike
      comment.likes = comment.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
      logger.info(`Comment unliked: ${comment._id} by user: ${req.user.username}`);
    } else {
      // Like
      comment.likes.push({ user: req.user._id });
      logger.info(`Comment liked: ${comment._id} by user: ${req.user.username}`);
    }

    await comment.save();
    await comment.populate('likes.user', 'username fullName profilePicture');

    res.json({
      message: existingLike ? 'Comment unliked' : 'Comment liked',
      likes: comment.likes
    });
  } catch (error) {
    logger.error(`Like/unlike comment operation failed for comment: ${req.params.id} by user: ${req.user.username} - ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.reportComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.isDeleted) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user already reported this comment
    const alreadyReported = comment.reportCount > 0 && comment.isReported;

    if (!alreadyReported) {
      comment.isReported = true;
      comment.reportCount = (comment.reportCount || 0) + 1;
      await comment.save();

      logger.info(`Comment ${comment._id} reported by user: ${req.user.username}`);
    }

    res.json({
      message: 'Comment reported successfully',
      reportCount: comment.reportCount
    });
  } catch (error) {
    logger.error(`Report comment failed for user: ${req.user.username} - ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
