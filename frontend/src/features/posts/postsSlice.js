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
      
      // Handle FormData for file uploads
      const formData = new FormData();
      formData.append('content', postData.content || '');
      if (postData.tags) {
        formData.append('tags', Array.isArray(postData.tags) ? postData.tags.join(',') : postData.tags);
      }
      if (postData.location) {
        formData.append('location', postData.location);
      }
      
      // Append files if present
      if (postData.files && postData.files.length > 0) {
        postData.files.forEach((file) => {
          formData.append('media', file);
        });
      }
      
      // Also support direct URLs
      if (postData.images && Array.isArray(postData.images)) {
        postData.images.forEach((image) => {
          formData.append('images', image);
        });
      }
      if (postData.videos && Array.isArray(postData.videos)) {
        postData.videos.forEach((video) => {
          formData.append('videos', video);
        });
      }
      
      const response = await axios.post(`${API_URL}/posts`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      logger.info(`Post created successfully: ${response.data.post._id}`);
      return response.data.post;
    } catch (error) {
      logger.error(`Post creation failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const reportPost = createAsyncThunk(
  'posts/reportPost',
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/posts/${postId}/report`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      logger.error(`Report post failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const sharePost = createAsyncThunk(
  'posts/sharePost',
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/posts/${postId}/share`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      logger.error(`Share post failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || error.message);
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
        const postId = action.payload.post?._id || action.payload._id;
        const index = state.posts.findIndex(post => post._id === postId);
        if (index !== -1) {
          state.posts[index].likes = action.payload.likes || action.payload.post?.likes || state.posts[index].likes;
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const postId = action.payload.comment?.post || action.payload.postId;
        const index = state.posts.findIndex(post => post._id === postId);
        if (index !== -1) {
          if (!state.posts[index].comments) {
            state.posts[index].comments = [];
          }
          state.posts[index].comments.push(action.payload.comment);
        }
      })

  }
});

export const { clearError, setCurrentPost, updatePostInList } = postsSlice.actions;
export default postsSlice.reducer;
