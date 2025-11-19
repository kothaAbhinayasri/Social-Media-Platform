import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import logger from '../../utils/logger';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchFeed = createAsyncThunk(
  'users/fetchFeed',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      logger.info(`Fetching feed - page: ${page}, limit: ${limit}`);
      const response = await axios.get(`${API_URL}/users/feed?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logger.info(`Feed fetched successfully: ${response.data.posts.length} posts`);
      return response.data;
    } catch (error) {
      logger.error(`Feed fetch failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const followUser = createAsyncThunk(
  'users/followUser',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      logger.info(`Following user: ${userId}`);
      const response = await axios.post(`${API_URL}/users/follow/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logger.info(`Successfully followed user: ${userId}`);
      return response.data;
    } catch (error) {
      logger.error(`Follow user failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getUserProfile = createAsyncThunk(
  'users/getUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      logger.info(`Fetching profile for user: ${userId}`);
      const response = await axios.get(`${API_URL}/users/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logger.info(`Profile fetched successfully for user: ${userId}`);
      return response.data;
    } catch (error) {
      logger.error(`Profile fetch failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    feed: [],
    currentUser: null,
    isLoading: false,
    error: null,
    feedPagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        // If it's the first page, replace posts. Otherwise, append them.
        if (action.payload.pagination.currentPage === 1) {
          state.feed = action.payload.posts;
        } else {
          state.feed = [...state.feed, ...action.payload.posts];
        }
        state.feedPagination = action.payload.pagination;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(followUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update current user if it's the same user
        if (state.currentUser && state.currentUser._id === action.payload.user._id) {
          state.currentUser = action.payload.user;
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update current user if it's the same user
        if (state.currentUser && state.currentUser.user && action.payload) {
          state.currentUser.user.followers = action.payload.user?.followers || state.currentUser.user.followers;
          state.currentUser.user.following = action.payload.user?.following || state.currentUser.user.following;
        }
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setCurrentUser } = usersSlice.actions;
export default usersSlice.reducer;
