import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './api/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/AdminDashboard';
import SpecialistDashboard from './pages/SpecialistDashboard';
import ProfilePage from './pages/ProfilePage';
import SuccessPage from './pages/SuccessPage';

import { NotificationProvider } from './api/NotificationContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.Role)) {
    // Redirect to their specific dashboard if they try to access a restricted view
    const dashboard = user.Role === 'Admin' ? '/admin' : user.Role === 'Specialist' ? '/specialist' : '/booking';
    return <Navigate to={dashboard} replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    const dashboard = user.Role === 'Admin' ? '/admin' : user.Role === 'Specialist' ? '/specialist' : '/booking';
    return <Navigate to={dashboard} replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public Routes - Protected against authenticated access */}
            <Route path="/" element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            } />
            <Route path="/register" element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            } />

            {/* Protected Routes with Layout */}
            <Route element={<Layout />}>
              <Route path="/booking" element={
                <ProtectedRoute allowedRoles={['User', 'Admin']}>
                  <BookingPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['User', 'Specialist', 'Admin']}>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/specialist" element={
                <ProtectedRoute allowedRoles={['Specialist', 'Admin']}>
                  <SpecialistDashboard />
                </ProtectedRoute>
              } />
              <Route path="/success" element={<SuccessPage />} />
            </Route>
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
