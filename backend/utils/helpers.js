// Utility functions for the social media platform

const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

const sanitizeHtml = (text) => {
  // Basic HTML sanitization - replace with a proper library in production
  return text.replace(/<[^>]*>/g, '');
};

const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const getPaginationInfo = (page, limit, totalItems) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    currentPage: page,
    totalPages,
    totalItems,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    itemsPerPage: limit
  };
};

module.exports = {
  generateRandomString,
  formatDate,
  validateEmail,
  validateUsername,
  sanitizeHtml,
  truncateText,
  getPaginationInfo
};
