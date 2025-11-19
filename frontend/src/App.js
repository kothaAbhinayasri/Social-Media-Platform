import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={token ? <Navigate to="/feed" /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={token ? <Navigate to="/feed" /> : <RegisterPage />}
          />
          <Route
            path="/feed"
            element={token ? <FeedPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={token ? <ProfilePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/user/:userId"
            element={token ? <ProfilePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/chat"
            element={token ? <ChatPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/notifications"
            element={token ? <NotificationsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={token ? <AdminDashboardPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={<Navigate to={token ? "/feed" : "/login"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
