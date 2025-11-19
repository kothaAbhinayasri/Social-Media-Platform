const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/socialmedia', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => logger.info('MongoDB connected'))
.catch(err => logger.error('MongoDB connection error:', err));

// Import models to register them
require('./models/User');
require('./models/Post');
require('./models/Comment');
require('./models/Message');
require('./models/Notification');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

// Socket.io for real-time features
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  socket.on('join', (userId) => {
    socket.join(userId);
    logger.debug(`User ${socket.id} joined room: ${userId}`);
  });

  socket.on('sendMessage', (data) => {
    io.to(data.receiverId).emit('receiveMessage', data);
    logger.info(`Message sent via socket from ${data.senderId} to ${data.receiverId}`);
  });

  socket.on('likePost', (data) => {
    io.emit('postLiked', data);
    logger.info(`Post liked: ${data.postId} by user ${data.userId}`);
  });

  socket.on('commentPost', (data) => {
    io.emit('postCommented', data);
    logger.info(`Comment added to post: ${data.postId} by user ${data.userId}`);
  });

  socket.on('followUser', (data) => {
    io.to(data.followedUserId).emit('userFollowed', data);
    logger.info(`User ${data.followerId} followed user ${data.followedUserId}`);
  });

  socket.on('newNotification', (data) => {
    io.to(data.userId).emit('notification', data);
    logger.info(`Notification sent to user: ${data.userId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
