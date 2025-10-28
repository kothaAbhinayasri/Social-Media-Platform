import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import logger from '../../utils/logger';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const followUser = createAsyncThunk(
  'users/followUser',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      logger.info(`Following user: ${userId}`);
      const response = await axios.post(`${API_URL}/users/${userId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logger.info(`Successfully followed user: ${userId}`);
      return response.data;
    } catch (error) {
      logger.error(`Follow user failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response.data);
    }
  }
);

export const getUserProfile = createAsyncThunk(
  'users/getUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      logger.info(`Fetching profile for user: ${userId}`);
      const response = await axios.get(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logger.info(`Profile fetched successfully for user: ${userId}`);
      return response.data;
    } catch (error) {
      logger.error(`Profile fetch failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response.data);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    currentUser: null,
    isLoading: false,
    error: null
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
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setCurrentUser } = usersSlice.actions;
export default usersSlice.reducer;
