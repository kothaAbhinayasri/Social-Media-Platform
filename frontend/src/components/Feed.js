import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, likePost, addComment, createPost } from '../features/posts/postsSlice';
import { logout } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const Feed = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts, isLoading, error, pagination } = useSelector(state => state.posts);
  const { user } = useSelector(state => state.auth);
  const [commentText, setCommentText] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    dispatch(fetchPosts({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleLike = (postId) => {
    dispatch(likePost(postId));
  };

  const handleComment = (postId) => {
    if (commentText.trim()) {
      dispatch(addComment({ postId, content: commentText }));
      setCommentText('');
      setSelectedPostId(null);
    }
  };

  const handleCreatePost = () => {
    if (newPostContent.trim()) {
      dispatch(createPost({ content: newPostContent }));
      setNewPostContent('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const loadMore = () => {
    if (pagination.currentPage < pagination.totalPages) {
      dispatch(fetchPosts({ page: pagination.currentPage + 1, limit: 10 }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Social Media Feed</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.fullName}</span>
              <button
                onClick={() => navigate('/profile')}
                className="text-indigo-600 hover:text-indigo-500"
              >
                Profile
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="text-indigo-600 hover:text-indigo-500"
              >
                Chat
              </button>
              <button
                onClick={() => navigate('/notifications')}
                className="text-indigo-600 hover:text-indigo-500"
              >
                Notifications
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Create Post */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md resize-none"
            rows="3"
            placeholder="What's on your mind?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          />
          <div className="flex justify-between items-center mt-3">
            <button
              onClick={handleCreatePost}
              disabled={!newPostContent.trim() || isLoading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {/* Posts */}
        {isLoading && posts.length === 0 ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error.message}</div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow p-6">
                {/* Post Header */}
                <div className="flex items-center mb-4">
                  <img
                    src={post.author.profilePicture || '/default-avatar.png'}
                    alt={post.author.fullName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{post.author.fullName}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-gray-800 mb-4">{post.content}</p>

                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                  <div className="mb-4">
                    {post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post ${index + 1}`}
                        className="w-full rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between border-t pt-4">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center space-x-2 ${
                      post.likes.includes(user?._id) ? 'text-red-600' : 'text-gray-600'
                    } hover:text-red-600`}
                  >
                    <span>❤️</span>
                    <span>{post.likes.length}</span>
                  </button>

                  <button
                    onClick={() => setSelectedPostId(selectedPostId === post._id ? null : post._id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
                  >
                    <span>💬</span>
                    <span>{post.comments.length}</span>
                  </button>

                  <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600">
                    <span>🔗</span>
                    <span>Share</span>
                  </button>
                </div>

                {/* Comments Section */}
                {selectedPostId === post._id && (
                  <div className="mt-4 border-t pt-4">
                    <div className="space-y-3 mb-4">
                      {post.comments.map((comment) => (
                        <div key={comment._id} className="flex space-x-3">
                          <img
                            src={comment.author.profilePicture || '/default-avatar.png'}
                            alt={comment.author.fullName}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="bg-gray-100 rounded-lg px-3 py-2">
                              <p className="font-semibold text-sm">{comment.author.fullName}</p>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                              <button className="hover:text-blue-600">Like ({comment.likes.length})</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment */}
                    <div className="flex space-x-3">
                      <img
                        src={user?.profilePicture || '/default-avatar.png'}
                        alt={user?.fullName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1 flex space-x-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a comment..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                        />
                        <button
                          onClick={() => handleComment(post._id)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm hover:bg-indigo-700"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Load More */}
            {pagination.currentPage < pagination.totalPages && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Feed;
