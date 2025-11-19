import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchReportedPosts,
  fetchReportedComments,
  fetchAllUsers,
  fetchAnalytics,
  removePost,
  removeComment,
  blockUser,
  unblockUser,
  dismissReport
} from '../features/admin/adminSlice';
import { logout } from '../features/auth/authSlice';

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { reportedPosts, reportedComments, users, analytics } = useSelector(state => state.admin);
  const [activeTab, setActiveTab] = useState('analytics');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/feed');
      return;
    }
    dispatch(fetchAnalytics(selectedPeriod));
  }, [dispatch, user, navigate, selectedPeriod]);

  const handleRemovePost = (postId) => {
    if (window.confirm('Are you sure you want to remove this post?')) {
      dispatch(removePost(postId));
    }
  };

  const handleRemoveComment = (commentId) => {
    if (window.confirm('Are you sure you want to remove this comment?')) {
      dispatch(removeComment(commentId));
    }
  };

  const handleBlockUser = (userId) => {
    if (window.confirm('Are you sure you want to block this user?')) {
      dispatch(blockUser(userId));
    }
  };

  const handleUnblockUser = (userId) => {
    if (window.confirm('Are you sure you want to unblock this user?')) {
      dispatch(unblockUser(userId));
    }
  };

  const handleDismissReport = (type, id) => {
    dispatch(dismissReport({ type, id }));
  };

  useEffect(() => {
    if (activeTab === 'reported-posts') {
      dispatch(fetchReportedPosts({ page: 1, limit: 20 }));
    } else if (activeTab === 'reported-comments') {
      dispatch(fetchReportedComments({ page: 1, limit: 20 }));
    } else if (activeTab === 'users') {
      dispatch(fetchAllUsers({ page: 1, limit: 20 }));
    }
  }, [dispatch, activeTab]);

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/feed')}
                className="text-indigo-600 hover:text-indigo-500"
              >
                Back to Feed
              </button>
              <button
                onClick={() => {
                  dispatch(logout());
                  navigate('/login');
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['analytics', 'reported-posts', 'reported-comments', 'users'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {activeTab === 'analytics' && (
          <div>
            <div className="mb-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                  <p className="text-3xl font-bold text-indigo-600">{analytics.users.total}</p>
                  <p className="text-sm text-gray-500">New: {analytics.users.new}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Total Posts</h3>
                  <p className="text-3xl font-bold text-indigo-600">{analytics.posts.total}</p>
                  <p className="text-sm text-gray-500">New: {analytics.posts.new}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Total Comments</h3>
                  <p className="text-3xl font-bold text-indigo-600">{analytics.comments.total}</p>
                  <p className="text-sm text-gray-500">New: {analytics.comments.new}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Total Likes</h3>
                  <p className="text-3xl font-bold text-indigo-600">{analytics.engagement.totalLikes}</p>
                  <p className="text-sm text-gray-500">Avg: {analytics.engagement.averageLikesPerPost}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reported-posts' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Reported Posts</h2>
              {reportedPosts.length === 0 ? (
                <p className="text-gray-500">No reported posts</p>
              ) : (
                <div className="space-y-4">
                  {reportedPosts.map((post) => (
                    <div key={post._id} className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold">{post.author.fullName}</p>
                          <p className="text-gray-700">{post.content}</p>
                          <p className="text-sm text-gray-500">Reports: {post.reportCount}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDismissReport('post', post._id)}
                            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleRemovePost(post._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reported-comments' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Reported Comments</h2>
              {reportedComments.length === 0 ? (
                <p className="text-gray-500">No reported comments</p>
              ) : (
                <div className="space-y-4">
                  {reportedComments.map((comment) => (
                    <div key={comment._id} className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold">{comment.author.fullName}</p>
                          <p className="text-gray-700">{comment.content}</p>
                          <p className="text-sm text-gray-500">Reports: {comment.reportCount}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDismissReport('comment', comment._id)}
                            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleRemoveComment(comment._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">All Users</h2>
              {users.length === 0 ? (
                <p className="text-gray-500">No users found</p>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user._id} className="border-b pb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{user.fullName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                        <div>
                          {user.isBlocked ? (
                            <button
                              onClick={() => handleUnblockUser(user._id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Unblock
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlockUser(user._id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              Block
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;

