const Post = require('../models/Post');
const User = require('../models/User');
const logger = require('../utils/logger');

exports.createPost = async (req, res) => {
  try {
    const { content, images, videos, tags, location } = req.body;

    logger.info(`Post creation attempt by user: ${req.user.username} (${req.user._id})`);

    const post = new Post({
      author: req.user._id,
      content,
      images: images || [],
      videos: videos || [],
      tags: tags || [],
      location
    });

    await post.save();

    // Add post to user's posts array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { posts: post._id }
    });

    await post.populate('author', 'username fullName profilePicture');

    logger.info(`Post created successfully: ${post._id} by user: ${req.user.username}`);

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    logger.error(`Post creation failed for user: ${req.user.username} - ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ isDeleted: false })
      .populate('author', 'username fullName profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username fullName profilePicture'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ isDeleted: false });

    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasNext: page * limit < totalPosts,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username fullName profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username fullName profilePicture'
        }
      });

    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { content, images, videos, tags, location } = req.body;

    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user._id,
      isDeleted: false
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.content = content || post.content;
    post.images = images || post.images;
    post.videos = videos || post.videos;
    post.tags = tags || post.tags;
    post.location = location || post.location;

    await post.save();
    await post.populate('author', 'username fullName profilePicture');

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user._id,
      isDeleted: false
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isDeleted = true;
    await post.save();

    // Remove post from user's posts array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { posts: post._id }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingLike = post.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
      logger.info(`Post unliked: ${post._id} by user: ${req.user.username}`);
    } else {
      // Like
      post.likes.push({ user: req.user._id });
      logger.info(`Post liked: ${post._id} by user: ${req.user.username}`);
    }

    await post.save();
    await post.populate('likes.user', 'username fullName profilePicture');

    res.json({
      message: existingLike ? 'Post unliked' : 'Post liked',
      likes: post.likes
    });
  } catch (error) {
    logger.error(`Like/unlike operation failed for post: ${req.params.id} by user: ${req.user.username} - ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.sharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingShare = post.shares.find(
      share => share.user.toString() === req.user._id.toString()
    );

    if (!existingShare) {
      post.shares.push({ user: req.user._id });
      await post.save();
    }

    res.json({
      message: 'Post shared successfully',
      shares: post.shares
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
