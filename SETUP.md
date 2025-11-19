# Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for file uploads)
- npm or yarn

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/socialmedia
JWT_SECRET=your-secret-key-change-this-in-production
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=http://localhost:3000
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```

### 4. Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Add them to your backend `.env` file

### 5. Create Admin User

To create an admin user, you can either:

**Option 1: Using MongoDB Shell**
```javascript
use socialmedia
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { isAdmin: true } }
)
```

**Option 2: Using MongoDB Compass**
1. Open MongoDB Compass
2. Connect to your database
3. Navigate to the `users` collection
4. Find your user document
5. Edit and set `isAdmin: true`

### 6. Testing the Application

1. **Register a new user** at `http://localhost:3000/register`
2. **Login** at `http://localhost:3000/login`
3. **Create posts** with text, images, or videos
4. **Follow other users** and see personalized feed
5. **Like, comment, and share** posts
6. **Check notifications** for real-time updates
7. **Access admin dashboard** (if you're an admin) at `http://localhost:3000/admin`

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- For MongoDB Atlas, ensure your IP is whitelisted

### File Upload Issues
- Verify Cloudinary credentials in `.env`
- Check file size limits (default: 50MB)
- Ensure file types are supported (images: jpg, png, gif, webp; videos: mp4, mov, avi, webm)

### CORS Issues
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that frontend is running on the correct port

### Socket.io Connection Issues
- Ensure backend server is running
- Check that `REACT_APP_API_URL` in frontend `.env` is correct
- Verify CORS settings in `server.js`

## Production Deployment

### Environment Variables
- Use strong, unique JWT secrets
- Use MongoDB Atlas or managed MongoDB service
- Configure Cloudinary for production
- Set proper CORS origins
- Use environment-specific URLs

### Security Checklist
- [ ] Change default JWT secret
- [ ] Use HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable MongoDB authentication
- [ ] Use environment variables (never commit secrets)
- [ ] Set up proper logging
- [ ] Configure backup strategy

## Next Steps

- Set up CI/CD pipeline
- Configure production database
- Set up monitoring and logging
- Configure CDN for static assets
- Set up automated backups
- Configure SSL certificates

