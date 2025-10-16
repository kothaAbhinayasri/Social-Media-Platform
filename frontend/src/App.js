import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import Login from './components/Login';
import Register from './components/Register';
import Feed from './components/Feed';
import Profile from './components/Profile';
import Chat from './components/Chat';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/login"
              element={token ? <Navigate to="/feed" /> : <Login />}
            />
            <Route
              path="/register"
              element={token ? <Navigate to="/feed" /> : <Register />}
            />
            <Route
              path="/feed"
              element={token ? <Feed /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={token ? <Profile /> : <Navigate to="/login" />}
            />
            <Route
              path="/chat"
              element={token ? <Chat /> : <Navigate to="/login" />}
            />
            <Route
              path="/"
              element={<Navigate to={token ? "/feed" : "/login"} />}
            />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
