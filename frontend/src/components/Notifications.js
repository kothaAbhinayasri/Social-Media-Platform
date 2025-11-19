import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationAsRead, deleteNotification } from '../features/notifications/notificationsSlice';

const Notifications = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { notifications, unreadCount, isLoading } = useSelector(state => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markNotificationAsRead('all'));
  };

  const handleDelete = (notificationId) => {
    dispatch(deleteNotification(notificationId));
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </h1>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <button
              onClick={() => navigate('/feed')}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Back to Feed
            </button>
          </div>
        </div>
      </header>

      {/* Notifications List */}
      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={notification.from?.profilePicture || '/default-avatar.png'}
                      alt={notification.from?.fullName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'text-gray-900'}`}>
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-xs text-indigo-600 hover:text-indigo-500"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="text-xs text-red-600 hover:text-red-500"
                      >
                        Delete
                      </button>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
