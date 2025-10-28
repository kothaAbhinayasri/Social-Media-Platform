import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import logger from '../../utils/logger';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      logger.info(`Fetching posts - page: ${page}, limit: ${limit}`);
      const response = await axios.get(`${API_URL}/posts?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logger.info(`Posts fetched successfully: ${response.data.posts.length} posts`);
      return response.data;
    } catch (error) {
      logger.error(`Posts fetch failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response.data);
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      logger.info(`Creating new post for user`);
      const response = await axios.post(`${API_URL}/posts`, postData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logger.info(`Post created successfully: ${response.data._id}`);
      return response.data;
    } catch (error) {
      logger.error(`Post creation failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response.data);
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      logger.info(`Liking post: ${postId}`);
      const response = await axios.post(`${API_URL}/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logger.info(`Post liked successfully: ${postId}`);
      return response.data;
    } catch (error) {
      logger.error(`Post like failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response.data);
    }
  }
);

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      logger.info(`Adding comment to post: ${postId}`);
      const response = await axios.post(`${API_URL}/comments`, { postId, content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logger.info(`Comment added successfully: ${response.data.comment._id}`);
      return response.data;
    } catch (error) {
      logger.error(`Comment addition failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response.data);
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    currentPost: null,
    isLoading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPost: (state, action) => {
      state.currentPost = action.payload;
    },
    updatePostInList: (state, action) => {
      const index = state.posts.findIndex(post => post._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(post => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const index = state.posts.findIndex(post => post._id === action.payload.comment.post);
        if (index !== -1) {
          state.posts[index].comments.push(action.payload.comment);
        }
      });
  }
});

export const { clearError, setCurrentPost, updatePostInList } = postsSlice.actions;
export default postsSlice.reducer;
