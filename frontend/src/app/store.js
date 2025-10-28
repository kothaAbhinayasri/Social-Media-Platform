import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import postsReducer from '../features/posts/postsSlice';
import chatReducer from '../features/chat/chatSlice';
import usersReducer from '../features/users/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    chat: chatReducer,
    users: usersReducer,
  },
});
