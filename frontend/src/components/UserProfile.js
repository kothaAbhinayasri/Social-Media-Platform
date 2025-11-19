import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile, followUser } from '../features/users/usersSlice';
import { useNavigate } from 'react-router-dom';
import { likePost, addComment, sharePost } from '../features/posts/postsSlice';

const UserProfile = ({ userId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser: profileUser, isLoading } = useSelector(state => state.users);
  const { user: currentUser } = useSelector(state => state.auth);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    if (userId) {
      dispatch(getUserProfile(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (profileUser) {
      setIsFollowing(profileUser.isFollowing || false);
    }
  }, [profileUser]);

  const handleFollow = () => {
    if (userId) {
      dispatch(followUser(userId)).then((result) => {
        if (result.payload) {
          setIsFollowing(result.payload.isFollowing);
        }
        dispatch(getUserProfile(userId));
      });
    }
  };

  const handleLike = (postId) => {
    dispatch(likePost(postId)).then(() => {
      dispatch(getUserProfile(userId));
    });
  };

  const handleComment = (postId) => {
    if (commentText.trim()) {
      dispatch(addComment({ postId, content: commentText })).then(() => {
        dispatch(getUserProfile(userId));
        setCommentText('');
        setSelectedPostId(null);
      });
    }
  };

  const isLiked = (post) => {
    if (!post.likes || !currentUser) return false;
    return post.likes.some(like => {
      const likeUserId = typeof like === 'object' ? (like.user?._id || like.user) : like;
      return likeUserId === currentUser.id || likeUserId === currentUser._id;
    });
  };

  const isOwnProfile = currentUser && profileUser && (
    currentUser.id === profileUser.user?._id || 
    currentUser._id === profileUser.user?._id
  );

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!profileUser || !profileUser.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">User not found</p>
          <button
            onClick={() => navigate('/feed')}
            className="text-indigo-600 hover:text-indigo-500"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  const user = profileUser.user;
  const posts = profileUser.posts || [];
  const stats = profileUser.stats || {};

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <button
              onClick={() => navigate('/feed')}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Back to Feed
            </button>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <img
                src={user.profilePicture || '/default-avatar.png'}
                alt={user.fullName}
                className="w-32 h-32 rounded-full border-4 border-indigo-500"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
                  <p className="text-gray-600">@{user.username}</p>
                </div>
                {!isOwnProfile && (
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-md font-medium ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/profile')}
                    className="px-6 py-2 rounded-md font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {user.bio && (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              )}

              {/* Stats */}
              <div className="flex space-x-6">
                <button
                  onClick={() => setShowFollowers(!showFollowers)}
                  className="text-center hover:text-indigo-600 cursor-pointer"
                >
                  <div className="font-bold text-lg">{stats.followersCount || user.followers?.length || 0}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </button>
                <button
                  onClick={() => setShowFollowing(!showFollowing)}
                  className="text-center hover:text-indigo-600 cursor-pointer"
                >
                  <div className="font-bold text-lg">{stats.followingCount || user.following?.length || 0}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </button>
                <div className="text-center">
                  <div className="font-bold text-lg">{stats.postsCount || posts.length}</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Followers/Following Modal */}
        {(showFollowers || showFollowing) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {showFollowers ? 'Followers' : 'Following'}
                </h3>
                <button
                  onClick={() => {
                    setShowFollowers(false);
                    setShowFollowing(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                {(showFollowers ? user.followers : user.following)?.map((person) => (
                  <div
                    key={person._id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => {
                      navigate(`/user/${person._id}`);
                      setShowFollowers(false);
                      setShowFollowing(false);
                    }}
                  >
                    <img
                      src={person.profilePicture || '/default-avatar.png'}
                      alt={person.fullName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{person.fullName}</p>
                      <p className="text-sm text-gray-600">@{person.username}</p>
                    </div>
                  </div>
                ))}
                {((showFollowers ? user.followers : user.following)?.length || 0) === 0 && (
                  <p className="text-gray-500 text-center py-4">No {showFollowers ? 'followers' : 'following'} yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4">Posts</h3>
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post._id} className="bg-white rounded-lg shadow p-6">
                  {/* Post Header */}
                  <div className="flex items-center mb-4">
                    <img
                      src={post.author?.profilePicture || user.profilePicture || '/default-avatar.png'}
                      alt={post.author?.fullName || user.fullName}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{post.author?.fullName || user.fullName}</h4>
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
                      onClick={() => handleLike(post._id)}
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
                      onClick={() => dispatch(sharePost(post._id))}
                      className="flex items-center space-x-2 text-gray-600 hover:text-green-600"
                    >
                      <span>🔗</span>
                      <span>Share ({post.shares?.length || 0})</span>
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
                                src={comment.author?.profilePicture || '/default-avatar.png'}
                                alt={comment.author?.fullName || 'User'}
                                className="w-8 h-8 rounded-full"
                              />
                              <div className="flex-1">
                                <div className="bg-gray-100 rounded-lg px-3 py-2">
                                  <p className="font-semibold text-sm">{comment.author?.fullName || 'User'}</p>
                                  <p className="text-sm">{comment.content}</p>
                                </div>
                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                  <span>{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-2">No comments yet</p>
                        )}
                      </div>

                      {/* Add Comment */}
                      <div className="flex space-x-3">
                        <img
                          src={currentUser?.profilePicture || '/default-avatar.png'}
                          alt={currentUser?.fullName}
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserProfile;

