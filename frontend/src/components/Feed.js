import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { likePost, addComment, createPost, sharePost, reportPost } from '../features/posts/postsSlice';
import { fetchFeed } from '../features/users/usersSlice';
import { logout } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import SearchUsers from './SearchUsers';

const Feed = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { feed: feedPosts, isLoading, error, feedPagination: pagination } = useSelector(state => state.users);
  const { user } = useSelector(state => state.auth);
  const [commentText, setCommentText] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    dispatch(fetchFeed({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleComment = (postId) => {
    const commentContent = commentInputs[postId] || commentText;
    if (commentContent.trim()) {
      dispatch(addComment({ postId, content: commentContent })).then(() => {
        // Refresh feed after adding comment
        dispatch(fetchFeed({ page: 1, limit: 10 }));
        setCommentInputs({ ...commentInputs, [postId]: '' });
        setCommentText('');
      });
    }
  };

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs({ ...commentInputs, [postId]: value });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
    // Revoke old URL
    URL.revokeObjectURL(previewUrls[index]);
  };

  const handleCreatePost = () => {
    if (newPostContent.trim() || selectedFiles.length > 0) {
      dispatch(createPost({ 
        content: newPostContent,
        files: selectedFiles
      })).then(() => {
        // Refresh feed after creating post
        dispatch(fetchFeed({ page: 1, limit: 10 }));
        setNewPostContent('');
        setSelectedFiles([]);
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setPreviewUrls([]);
      });
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const loadMore = () => {
    if (pagination && pagination.currentPage < pagination.totalPages) {
      dispatch(fetchFeed({ page: pagination.currentPage + 1, limit: 10 }));
    }
  };

  const isLiked = (post) => {
    if (!post.likes || !user) return false;
    return post.likes.some(like => {
      const likeUserId = typeof like === 'object' ? (like.user?._id || like.user) : like;
      return likeUserId === user.id || likeUserId === user._id;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Social Media Feed</h1>
            <div className="flex items-center space-x-4">
              <div className="flex-1 max-w-md">
                <SearchUsers />
              </div>
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
              {user?.isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="text-purple-600 hover:text-purple-500"
                >
                  Admin
                </button>
              )}
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
          
          {/* File Preview */}
          {previewUrls.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-3">
            <label className="cursor-pointer bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              📎 Add Media
            </label>
            <button
              onClick={handleCreatePost}
              disabled={(!newPostContent.trim() && selectedFiles.length === 0) || isLoading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {/* Posts */}
        {isLoading && (!feedPosts || feedPosts.length === 0) ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error.message || 'Error loading feed'}</div>
        ) : !feedPosts || feedPosts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No posts in your feed yet.</p>
            <p className="text-sm text-gray-400">Follow some users to see their posts here!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedPosts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow p-6">
                {/* Post Header */}
                <div className="flex items-center mb-4">
                  <img
                    src={post.author?.profilePicture || '/default-avatar.png'}
                    alt={post.author?.fullName}
                    className="w-10 h-10 rounded-full mr-3 cursor-pointer hover:opacity-80"
                    onClick={() => navigate(`/user/${post.author?._id || post.author}`)}
                  />
                  <div className="flex-1">
                    <h3 
                      className="font-semibold text-gray-900 cursor-pointer hover:text-indigo-600"
                      onClick={() => navigate(`/user/${post.author?._id || post.author}`)}
                    >
                      {post.author?.fullName || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-gray-800 mb-4">{post.content}</p>

                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                  <div className="mb-4 grid grid-cols-1 gap-2">
                    {post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post ${index + 1}`}
                        className="w-full rounded-lg max-h-96 object-cover"
                      />
                    ))}
                  </div>
                )}

                {/* Post Videos */}
                {post.videos && post.videos.length > 0 && (
                  <div className="mb-4 grid grid-cols-1 gap-2">
                    {post.videos.map((video, index) => (
                      <video
                        key={index}
                        src={video}
                        controls
                        className="w-full rounded-lg max-h-96"
                      >
                        Your browser does not support the video tag.
                      </video>
                    ))}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between border-t pt-4">
                  <button
                    onClick={() => {
                      dispatch(likePost(post._id)).then(() => {
                        dispatch(fetchFeed({ page: 1, limit: 10 }));
                      });
                    }}
                    className={`flex items-center space-x-2 ${
                      isLiked(post) ? 'text-red-600' : 'text-gray-600'
                    } hover:text-red-600`}
                  >
                    <span>{isLiked(post) ? '❤️' : '🤍'}</span>
                    <span>{post.likes?.length || 0}</span>
                  </button>

                  <button
                    onClick={() => setSelectedPostId(selectedPostId === post._id ? null : post._id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
                  >
                    <span>💬</span>
                    <span>{post.comments?.length || 0}</span>
                  </button>

                  <button 
                    onClick={() => {
                      dispatch(sharePost(post._id)).then(() => {
                        dispatch(fetchFeed({ page: 1, limit: 10 }));
                      });
                    }}
                    className="flex items-center space-x-2 text-gray-600 hover:text-green-600"
                  >
                    <span>🔗</span>
                    <span>Share ({post.shares?.length || 0})</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to report this post?')) {
                        dispatch(reportPost(post._id));
                      }
                    }}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600"
                    title="Report post"
                  >
                    <span>🚩</span>
                  </button>
                </div>

                {/* Comments Section */}
                {selectedPostId === post._id && (
                  <div className="mt-4 border-t pt-4">
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment) => (
                          <div key={comment._id || comment} className="flex space-x-3">
                            <img
                              src={comment.author?.profilePicture || comment.profilePicture || '/default-avatar.png'}
                              alt={comment.author?.fullName || comment.fullName || 'User'}
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="bg-gray-100 rounded-lg px-3 py-2">
                                <p className="font-semibold text-sm">{comment.author?.fullName || comment.fullName || 'User'}</p>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                <span>{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}</span>
                                <button className="hover:text-blue-600">Like ({comment.likes?.length || 0})</button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-2">No comments yet. Be the first to comment!</p>
                      )}
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
                          value={commentInputs[post._id] || ''}
                          onChange={(e) => handleCommentInputChange(post._id, e.target.value)}
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
            {pagination && pagination.currentPage < pagination.totalPages && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Load More'}
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
