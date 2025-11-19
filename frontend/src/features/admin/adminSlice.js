import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import logger from '../../utils/logger';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchReportedPosts = createAsyncThunk(
  'admin/fetchReportedPosts',
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/reported/posts?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      logger.error(`Fetch reported posts failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchReportedComments = createAsyncThunk(
  'admin/fetchReportedComments',
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/reported/comments?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      logger.error(`Fetch reported comments failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async ({ page = 1, limit = 20, search, isBlocked }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      if (isBlocked !== undefined) params.append('isBlocked', isBlocked);
      const response = await axios.get(`${API_URL}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      logger.error(`Fetch all users failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async (period = '7d', { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      logger.error(`Fetch analytics failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removePost = createAsyncThunk(
  'admin/removePost',
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return postId;
    } catch (error) {
      logger.error(`Remove post failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeComment = createAsyncThunk(
  'admin/removeComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return commentId;
    } catch (error) {
      logger.error(`Remove comment failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const blockUser = createAsyncThunk(
  'admin/blockUser',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/admin/users/${userId}/block`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.user;
    } catch (error) {
      logger.error(`Block user failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const unblockUser = createAsyncThunk(
  'admin/unblockUser',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/admin/users/${userId}/unblock`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.user;
    } catch (error) {
      logger.error(`Unblock user failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const dismissReport = createAsyncThunk(
  'admin/dismissReport',
  async ({ type, id }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/dismiss-report`, { type, id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { type, id };
    } catch (error) {
      logger.error(`Dismiss report failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    reportedPosts: [],
    reportedComments: [],
    users: [],
    analytics: null,
    isLoading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportedPosts.fulfilled, (state, action) => {
        state.reportedPosts = action.payload.posts;
      })
      .addCase(fetchReportedComments.fulfilled, (state, action) => {
        state.reportedComments = action.payload.comments;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users = action.payload.users;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
      .addCase(removePost.fulfilled, (state, action) => {
        state.reportedPosts = state.reportedPosts.filter(
          post => post._id !== action.payload
        );
      })
      .addCase(removeComment.fulfilled, (state, action) => {
        state.reportedComments = state.reportedComments.filter(
          comment => comment._id !== action.payload
        );
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index].isBlocked = true;
        }
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index].isBlocked = false;
        }
      })
      .addCase(dismissReport.fulfilled, (state, action) => {
        if (action.payload.type === 'post') {
          state.reportedPosts = state.reportedPosts.filter(
            post => post._id !== action.payload.id
          );
        } else if (action.payload.type === 'comment') {
          state.reportedComments = state.reportedComments.filter(
            comment => comment._id !== action.payload.id
          );
        }
      });
  }
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;

