import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile, updateProfile } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import UserProfile from './UserProfile';

const Profile = ({ userId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading } = useSelector(state => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    profilePicture: '',
    coverPicture: ''
  });
  const [selectedProfilePic, setSelectedProfilePic] = useState(null);
  const [selectedCoverPic, setSelectedCoverPic] = useState(null);

  useEffect(() => {
    if (!userId) {
      dispatch(getProfile());
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (user && !userId) {
      setFormData({
        fullName: user.fullName || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || '',
        coverPicture: user.coverPicture || ''
      });
    }
  }, [user, userId]);

  // If userId is provided, show that user's profile
  if (userId) {
    return <UserProfile userId={userId} />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'profile') {
        setSelectedProfilePic(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({ ...formData, profilePicture: reader.result });
        };
        reader.readAsDataURL(file);
      } else if (type === 'cover') {
        setSelectedCoverPic(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({ ...formData, coverPicture: reader.result });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    submitData.append('fullName', formData.fullName);
    submitData.append('bio', formData.bio);
    if (selectedProfilePic) {
      submitData.append('profilePicture', selectedProfilePic);
    } else if (formData.profilePicture) {
      submitData.append('profilePicture', formData.profilePicture);
    }
    if (selectedCoverPic) {
      submitData.append('coverPicture', selectedCoverPic);
    } else if (formData.coverPicture) {
      submitData.append('coverPicture', formData.coverPicture);
    }
    
    dispatch(updateProfile(submitData));
    setIsEditing(false);
    setSelectedProfilePic(null);
    setSelectedCoverPic(null);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      bio: user?.bio || '',
      profilePicture: user?.profilePicture || ''
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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
        {/* Cover Picture */}
        {user?.coverPicture && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img
              src={user.coverPicture}
              alt="Cover"
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={user?.profilePicture || '/default-avatar.png'}
              alt={user?.fullName}
              className="w-32 h-32 rounded-full border-4 border-indigo-500 mb-4"
            />
            {isEditing && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'profile')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {!selectedProfilePic && (
                  <input
                    type="url"
                    name="profilePicture"
                    value={formData.profilePicture}
                    onChange={handleChange}
                    placeholder="Or enter profile picture URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                  />
                )}
                <label className="block text-sm font-medium text-gray-700 mt-4">Cover Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'cover')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {!selectedCoverPic && (
                  <input
                    type="url"
                    name="coverPicture"
                    value={formData.coverPicture}
                    onChange={handleChange}
                    placeholder="Or enter cover picture URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                  />
                )}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <p className="mt-1 text-gray-900">@{user?.username}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{user?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              ) : (
                <p className="mt-1 text-gray-900">{user?.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              ) : (
                <p className="mt-1 text-gray-900">{user?.bio || 'No bio yet'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Member since</label>
              <p className="mt-1 text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className="flex space-x-4 text-sm text-gray-600">
              <span>{user?.followers?.length || 0} followers</span>
              <span>{user?.following?.length || 0} following</span>
              <span>{user?.posts?.length || 0} posts</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSubmit}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
