import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations, fetchMessages, sendMessage } from '../features/chat/chatSlice';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const Chat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversations, messages, isLoading } = useSelector(state => state.chat);
  const { user } = useSelector(state => state.auth);
  const [messageText, setMessageText] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    dispatch(fetchConversations());

    // Initialize socket connection
    socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');

    socketRef.current.on('connect', () => {
      console.log('Connected to socket');
      socketRef.current.emit('join', user?._id);
    });

    // Socket listeners are now handled in store.js

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [dispatch, user]);

  useEffect(() => {
    if (selectedUser) {
      dispatch(fetchMessages(selectedUser._id));
    }
  }, [selectedUser, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim() && selectedUser) {
      dispatch(sendMessage({
        receiverId: selectedUser._id,
        content: messageText
      }));
      setMessageText('');
    }
  };

  const selectConversation = (conversation) => {
    const otherUser = conversation.participants.find(p => p._id !== user?._id);
    setSelectedUser(otherUser);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <button
              onClick={() => navigate('/feed')}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Back to Feed
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow h-96 flex">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Conversations</h2>
            </div>
            <div className="overflow-y-auto h-full">
              {isLoading ? (
                <div className="p-4 text-center">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No conversations yet</div>
              ) : (
                conversations.map((conversation) => {
                  const otherUser = conversation.participants.find(p => p._id !== user?._id);
                  return (
                    <div
                      key={conversation._id}
                      onClick={() => selectConversation(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedUser?._id === otherUser._id ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <img
                          src={otherUser.profilePicture || '/default-avatar.png'}
                          alt={otherUser.fullName}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{otherUser.fullName}</h3>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <img
                      src={selectedUser.profilePicture || '/default-avatar.png'}
                      alt={selectedUser.fullName}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <h2 className="text-lg font-semibold">{selectedUser.fullName}</h2>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender._id === user?._id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender._id === user?._id ? 'text-indigo-200' : 'text-gray-500'
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-lg">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
