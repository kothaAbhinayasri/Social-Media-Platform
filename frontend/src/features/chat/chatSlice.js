import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/chat/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ receiverId, content, messageType = 'text', mediaUrl = null }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/chat/send`, {
        receiverId,
        content,
        messageType,
        mediaUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    currentConversation: null,
    messages: [],
    isLoading: false,
    error: null,
    onlineUsers: []
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    addMessage: (state, action) => {
      const message = action.payload;
      state.messages.push(message);

      // Update conversation's last message
      const conversation = state.conversations.find(conv =>
        conv.participants.some(p => p._id === message.sender._id || p._id === message.receiver._id)
      );
      if (conversation) {
        conversation.lastMessage = message;
      }
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    markMessagesAsRead: (state, action) => {
      const { conversationId } = action.payload;
      state.messages.forEach(message => {
        if (message.conversationId === conversationId && !message.isRead) {
          message.isRead = true;
        }
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
        // Update conversation
        const conversation = state.conversations.find(conv =>
          conv.participants.some(p => p._id === action.payload.receiver._id)
        );
        if (conversation) {
          conversation.lastMessage = action.payload;
        }
      });
  }
});

export const {
  clearError,
  setCurrentConversation,
  addMessage,
  setOnlineUsers,
  markMessagesAsRead
} = chatSlice.actions;
export default chatSlice.reducer;
