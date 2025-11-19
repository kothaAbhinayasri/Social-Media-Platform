import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import postsReducer from '../features/posts/postsSlice';
import chatReducer from '../features/chat/chatSlice';
import usersReducer from '../features/users/usersSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import adminReducer from '../features/admin/adminSlice';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    chat: chatReducer,
    users: usersReducer,
    notifications: notificationsReducer,
    admin: adminReducer,
  },
});

// Socket.io integration
const socket = io(API_URL);

// Add socket listeners to dispatch actions
socket.on('connect', () => {
  const token = localStorage.getItem('token');
  if (token) {
    // Extract user ID from token (you may need to decode JWT)
    socket.emit('join', token); // You might want to decode token to get userId
  }
});

socket.on('notification', (data) => {
  store.dispatch({ type: 'notifications/addNotification', payload: data });
});
socket.on('receiveMessage', (message) => {
  store.dispatch({ type: 'chat/addMessage', payload: message });
});

socket.on('postLiked', (data) => {
  store.dispatch({ type: 'posts/updatePostInList', payload: data.post });
});

socket.on('postCommented', (data) => {
  store.dispatch({ type: 'posts/updatePostInList', payload: data.post });
});

socket.on('userFollowed', (data) => {
  // Handle follow notification - could dispatch to a notifications slice
  console.log('User followed:', data);
});

export { socket };
