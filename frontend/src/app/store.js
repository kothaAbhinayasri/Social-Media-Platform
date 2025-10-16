import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import postsReducer from '../features/posts/postsSlice';
import chatReducer from '../features/chat/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    chat: chatReducer,
  },
});
