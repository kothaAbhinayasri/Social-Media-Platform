const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const uploadUtils = require('../utils/upload');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, bio } = req.body;

    logger.info(`Registration attempt for email: ${email}, username: ${username}`);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      logger.warn(`Registration failed: ${existingUser.email === email ? 'Email' : 'Username'} already exists`);
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already exists' : 'Username already exists'
      });
    }

    const user = new User({
      username,
      email,
      password,
      fullName,
      bio
    });

    await user.save();

    const token = generateToken(user._id);

    logger.info(`User registered successfully: ${user._id}`);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info(`Login attempt for email: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login failed: User not found for email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password for user: ${user._id}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      logger.warn(`Login blocked for user: ${user._id}`);
      return res.status(403).json({ message: 'Account is blocked' });
    }

    const token = generateToken(user._id);

    // Update last active
    user.lastActive = new Date();
    await user.save();

    logger.info(`User logged in successfully: ${user._id}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        bio: user.bio,
        followersCount: user.followers.length,
        followingCount: user.following.length
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'username fullName profilePicture')
      .populate('following', 'username fullName profilePicture');

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, bio } = req.body;
    let profilePicture = req.body.profilePicture;
    let coverPicture = req.body.coverPicture;

    // Handle file uploads if present
    if (req.files) {
      for (const file of req.files) {
        try {
          const result = await uploadUtils.uploadToCloudinary(
            file, 
            file.fieldname === 'profilePicture' ? 'social-media/profiles' : 'social-media/covers'
          );
          if (file.fieldname === 'profilePicture') {
            profilePicture = result.secure_url;
          } else if (file.fieldname === 'coverPicture') {
            coverPicture = result.secure_url;
          }
        } catch (uploadError) {
          logger.error(`File upload failed: ${uploadError.message}`);
        }
      }
    }

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (coverPicture !== undefined) updateData.coverPicture = coverPicture;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    logger.error(`Profile update failed for user: ${req.user.username} - ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
