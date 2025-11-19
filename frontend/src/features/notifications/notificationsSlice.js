import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import logger from '../../utils/logger';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      logger.info(`Fetching notifications - page: ${page}, limit: ${limit}`);
      const response = await axios.get(`${API_URL}/notifications?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logger.info(`Notifications fetched successfully: ${response.data.notifications.length} notifications`);
      return response.data;
    } catch (error) {
      logger.error(`Notifications fetch failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = notificationId === 'all' 
        ? `${API_URL}/notifications/all/read`
        : `${API_URL}/notifications/${notificationId}/read`;
      const response = await axios.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logger.info(`Notification marked as read: ${notificationId}`);
      return { notificationId, notification: response.data.notification };
    } catch (error) {
      logger.error(`Mark notification as read failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logger.info(`Notification deleted: ${notificationId}`);
      return notificationId;
    } catch (error) {
      logger.error(`Delete notification failed: ${error.response?.data?.message || error.message}`);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalNotifications: 0
    }
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        if (action.payload.notificationId === 'all') {
          state.notifications.forEach(notif => {
            notif.isRead = true;
            notif.readAt = new Date();
          });
          state.unreadCount = 0;
        } else {
          const index = state.notifications.findIndex(
            notif => notif._id === action.payload.notificationId
          );
          if (index !== -1) {
            state.notifications[index].isRead = true;
            state.notifications[index].readAt = new Date();
            if (state.unreadCount > 0) {
              state.unreadCount -= 1;
            }
          }
        }
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(
          notif => notif._id !== action.payload
        );
      });
  }
});

export const { addNotification, clearError } = notificationsSlice.actions;
export default notificationsSlice.reducer;

