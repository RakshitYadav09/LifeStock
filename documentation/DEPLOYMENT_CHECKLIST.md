# LifeStock Deployment Checklist

## Local Development Setup (CURRENT)
- [x] Development environment files created
- [x] CORS configured for localhost
- [x] Frontend points to localhost:5000
- [x] Backend accepts requests from localhost:3000
- [ ] MongoDB running locally (install MongoDB or use MongoDB Compass)
- [ ] Backend server running (`npm run dev` in server directory)
- [ ] Frontend client running (`npm start` in client directory)

**Quick Start**: Run `start-dev.bat` to start both frontend and backend

## Pre-Deployment Checklist
- [ ] .gitignore files created in root, client, and server directories
- [ ] Environment variables configured for production
- [ ] MongoDB Atlas cluster created and configured
- [ ] Strong JWT secret generated
- [ ] Google OAuth credentials configured

## Git Repository Setup
- [ ] Git repository initialized in root directory
- [ ] All files added and committed
- [ ] Private GitHub repository created
- [ ] Local repository connected to GitHub remote
- [ ] Initial push completed successfully

## Backend Deployment (Render)
- [ ] Render account created
- [ ] Web service created and connected to GitHub
- [ ] Root directory set to `server`
- [ ] Build command set to `npm install`
- [ ] Start command set to `npm start`
- [ ] Environment variables added:
  - [ ] NODE_ENV=production
  - [ ] MONGO_URI (MongoDB Atlas connection string)
  - [ ] JWT_SECRET (strong random string)
  - [ ] GOOGLE_CLIENT_ID
- [ ] Service deployed successfully
- [ ] Backend URL copied for frontend configuration

## Frontend Deployment (Vercel)
- [ ] Vercel account created
- [ ] Project created and connected to GitHub
- [ ] Root directory set to `client`
- [ ] Framework preset set to Create React App
- [ ] Environment variables added:
  - [ ] REACT_APP_API_BASE_URL (Render backend URL)
  - [ ] REACT_APP_API_URL (Render backend URL)
  - [ ] REACT_APP_GOOGLE_CLIENT_ID
- [ ] Project deployed successfully
- [ ] Frontend URL copied

## Post-Deployment Testing
- [ ] User registration works
- [ ] User login works
- [ ] Google OAuth login works
- [ ] Task CRUD operations work
- [ ] Friend requests and management work
- [ ] Calendar events work
- [ ] Shared lists work
- [ ] Real-time updates work
- [ ] No console errors
- [ ] All API calls successful

## Production URLs
- Frontend (Vercel): _________________________
- Backend (Render): __________________________
- Database (MongoDB Atlas): __________________

## Security Considerations
- [ ] .env files are in .gitignore
- [ ] Strong JWT secret used
- [ ] MongoDB Atlas has proper network access configuration
- [ ] Google OAuth origins updated for production domains
- [ ] CORS configured for production frontend domain

## Backup Information
- MongoDB Atlas Username: lifestock-user
- MongoDB Atlas Password: ___________________
- JWT Secret: abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567ABC890DEF123GHI456JKL789
- Google Client ID: 829189813819-ciqvhl0olkfcrrgq7ib7cr34hq2tpaei.apps.googleusercontent.com
