import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserCollaborationProvider } from './context/UserCollaborationContext';
import { NotificationProvider } from './context/NotificationContext';
import AuthContext from './context/AuthContext';
import NavigationBar from './components/NavigationBar';
import FloatingQuickAddButton from './components/FloatingQuickAddButton';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FriendsPage from './pages/FriendsPage';
import AllTasksPage from './pages/AllTasksPage';
import CalendarPage from './pages/CalendarPage';
import SharedListsPage from './pages/SharedListsPage';
import SharedListDetailsPage from './pages/SharedListDetailsPage';
import './App.css';

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  return user ? <Navigate to="/" /> : children;
};

function AppContent() {
  const { user } = useContext(AuthContext);
  return (
    <Router>
      <div className="min-h-screen bg-neutral-50">
        <NavigationBar />
        <main className="pb-6">
          <Routes>
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/friends" 
              element={
                <PrivateRoute>
                  <FriendsPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/shared-tasks" 
              element={
                <PrivateRoute>
                  <AllTasksPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/calendar" 
              element={
                <PrivateRoute>
                  <CalendarPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/shared-lists"
              element={
                <PrivateRoute>
                  <SharedListsPage />
                </PrivateRoute>
              }
            />
            <Route 
              path="/shared-lists/:id"
              element={
                <PrivateRoute>
                  <SharedListDetailsPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
        {user && <FloatingQuickAddButton />}
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <UserCollaborationProvider>
          <AppContent />
        </UserCollaborationProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
