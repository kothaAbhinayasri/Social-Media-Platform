import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SearchUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setUsers([]);
        return;
      }

      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/users/search?query=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data.users || []);
      } catch (error) {
        console.error('Search failed:', error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
    setSearchQuery('');
    setUsers([]);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search users..."
        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      
      {/* Search Results Dropdown */}
      {searchQuery.trim().length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : users.length > 0 ? (
            <div className="py-2">
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user._id)}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                >
                  <img
                    src={user.profilePicture || '/default-avatar.png'}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{user.fullName}</p>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                    {user.bio && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{user.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchUsers;

