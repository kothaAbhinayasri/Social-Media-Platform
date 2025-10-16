# Social Media Platform Setup TODO

## Backend Setup
- [x] Create backend directory and initialize Node.js project (package.json)
- [x] Install backend dependencies (express, mongoose, jsonwebtoken, bcryptjs, socket.io, cors, dotenv)
- [x] Create models: User.js, Post.js, Comment.js, Message.js
- [x] Create routes: auth.js, posts.js, users.js, chat.js
- [x] Create controllers: authController.js, postController.js, userController.js, chatController.js
- [x] Create middleware: auth.js (JWT verification)
- [x] Create config: database.js (MongoDB connection)
- [x] Create utils: helpers.js
- [x] Create server.js (main entry point with Express app, Socket.io setup, MongoDB connection)

## Frontend Setup
- [x] Create frontend directory and initialize React app with Redux template
- [x] Install frontend dependencies (tailwindcss, @reduxjs/toolkit, socket.io-client, axios, react-router-dom)
- [x] Create basic components: Login, Signup, Feed, Profile, Chat, Post, Comment
- [x] Set up Redux store and slices
- [x] Configure Tailwind CSS

## Project Configuration
- [x] Create .env.example for environment variables
- [x] Create docker-compose.yml for local development with MongoDB
- [x] Create .gitignore
- [x] Create README.md with project overview, features, tech stack, etc.

## Followup Steps
- [x] Run npm install in backend and frontend
- [x] Test the setup by running the servers
