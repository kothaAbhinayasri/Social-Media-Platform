# Social Media Platform

A full-stack social media platform built with React, Node.js, Express, MongoDB, and Socket.io. Similar to Instagram and Twitter, it allows users to connect, share content, and interact in real-time.

## 🚀 Features

### User Profiles & Connections
- ✅ Signup/login with JWT authentication
- ✅ Profile creation and updates
- ✅ Follow/unfollow system

### Posts & Interactions
- ✅ Create, edit, and delete posts (text, images, videos)
- ✅ Like, comment, and share features
- ✅ Personalized news feed

### Real-Time Features
- ✅ WebSocket-based chat system
- ✅ Real-time notifications for likes, comments, and follows
- ✅ Live feed updates

### Admin & Moderation
- 🔄 Monitor and remove reported content
- 🔄 Block/ban inappropriate users
- 🔄 Analytics on engagement and growth

## 🛠 Technology Stack

### Frontend
- **React.js** - UI library
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Socket.io-client** - Real-time communication
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Socket.io** - Real-time communication
- **Cloudinary** - Media storage

### Deployment
- **AWS/GCP** - Cloud hosting
- **Vercel/Netlify** - Frontend deployment
- **Docker** - Containerization

## 📁 Project Structure

```
social-media-platform/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── app/
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-media-platform
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest

   # Or using local MongoDB installation
   mongod
   ```

6. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

7. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Using Docker Compose

```bash
docker-compose up --build
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Posts
- `GET /api/posts` - Get posts feed
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/follow` - Follow/unfollow user

### Chat
- `GET /api/chat/conversations` - Get user conversations
- `GET /api/chat/messages/:userId` - Get messages with user
- `POST /api/chat/send` - Send message
- `DELETE /api/chat/:id` - Delete message

## 🔧 Development

### Available Scripts

#### Backend
```bash
npm start      # Start production server
npm run dev    # Start development server with nodemon
npm test       # Run tests
```

#### Frontend
```bash
npm start      # Start development server
npm run build  # Build for production
npm test       # Run tests
npm run eject  # Eject from Create React App
```

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks

## 🚀 Deployment

### Backend Deployment
1. Set environment variables in your cloud platform
2. Deploy to AWS/GCP or similar
3. Set up MongoDB Atlas or cloud database
4. Configure reverse proxy (nginx)

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Configure environment variables

### Docker Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔒 Security Features
- JWT authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet for security headers

## 📊 Future Enhancements
- ✅ AI-driven content recommendations
- 🔄 Live video streaming support
- 🔄 AR-based media filters
- 🔄 Advanced analytics dashboard
- 🔄 Push notifications
- 🔄 Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@socialmediaplatform.com or join our Discord community.

## 🙏 Acknowledgments
- React community
- Node.js community
- MongoDB community
- All contributors
