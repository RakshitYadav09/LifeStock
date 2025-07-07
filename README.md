# MERN Stack Task Management Application

A full-stack task management application built with MongoDB, Express.js, React, and Node.js.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Task Management**: Create, read, update, and delete tasks
- **Task Completion**: Mark tasks as completed or incomplete
- **Real-time Updates**: Immediate UI updates for all operations
- **Responsive Design**: Modern, mobile-friendly interface with Tailwind CSS
- **Protected Routes**: Secure access to authenticated content

## Project Structure

```
tasks/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React Context for state management
│   │   ├── pages/          # Main application pages
│   │   ├── services/       # API service layer
│   │   └── ...
│   └── package.json
├── server/                 # Express.js backend
│   ├── config/            # Database configuration
│   ├── controllers/       # Business logic
│   ├── middleware/        # Custom middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── .env              # Environment variables
│   ├── server.js         # Server entry point
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd tasks
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/tasksapp
JWT_SECRET=your_jwt_secret_key_here_replace_in_production
```

### 3. Frontend Setup
```bash
cd client
npm install
```

Create a `.env` file in the client directory:
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

## Running the Application

### Development Mode

1. **Start the backend server:**
```bash
cd server
npm run dev
```
The server will start on http://localhost:5000

2. **Start the frontend application:**
```bash
cd client
npm start
```
The React app will start on http://localhost:3000

### Production Mode

1. **Build the frontend:**
```bash
cd client
npm run build
```

2. **Start the backend:**
```bash
cd server
npm start
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user

### Tasks (Protected Routes)
- `GET /api/tasks` - Get all tasks for authenticated user
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Database Schema

### User Model
```javascript
{
  username: String (required, unique)
  email: String (required, unique)
  password: String (required, hashed)
  timestamps: true
}
```

### Task Model
```javascript
{
  title: String (required)
  description: String
  completed: Boolean (default: false)
  user: ObjectId (ref: 'User', required)
  timestamps: true
}
```

## Technologies Used

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **React Context** - State management

## Deployment

### Backend (Vercel/Heroku)
1. Set environment variables in your hosting platform
2. Deploy the server directory
3. Update CORS settings for your frontend domain

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the build directory
3. Update API base URL for production

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Update the MONGO_URI in your environment variables
3. Configure network access and database users

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository or contact the development team.
