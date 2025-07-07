# LifeStock Local Development Setup

## Quick Start Commands

### 1. Start MongoDB (if using local MongoDB)
```bash
# On Windows with MongoDB installed
mongod

# Or if using MongoDB Compass, just open the application
```

### 2. Start the Backend Server
```bash
cd server
npm install
npm run dev
# OR
node server.js
```

### 3. Start the Frontend Client (in a new terminal)
```bash
cd client
npm install
npm start
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017/tasksapp

## Environment Configuration

The application now uses:
- `.env.development` files for local development
- `.env.production` files for production deployment

Current development configuration:
- Frontend points to `http://localhost:5000/api`
- Backend accepts CORS from `http://localhost:3000`
- Uses local MongoDB database

## Troubleshooting

### If you get CORS errors:
1. Make sure the backend server is running on port 5000
2. Make sure the frontend is running on port 3000
3. Check that both services are using the development environment files

### If MongoDB connection fails:
1. Make sure MongoDB is installed and running locally
2. Or update the MONGO_URI in `.env.development` to point to your MongoDB Atlas cluster

### If Google OAuth doesn't work:
1. Make sure your Google Cloud Console has `http://localhost:3000` in authorized origins
2. Check that the Google Client ID is correct in both frontend and backend

## Production Deployment

When ready to deploy:
1. Copy `.env.production` to `.env` in both client and server directories
2. Update the URLs in production files with your actual deployment URLs
3. Follow the deployment guide in DEPLOYMENT_CHECKLIST.md
