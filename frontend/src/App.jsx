import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Profile from './pages/Profile';
import Drives from './pages/Drives';
import NotFound from './pages/NotFound';

// Router component to render corresponding dashboard based on authenticated user's role
const RoleDashboardRouter = () => {
  const { user } = useAuthStore();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'recruiter') return <RecruiterDashboard />;
  return <StudentDashboard />;
};

const App = () => {
  const { loadUser, token } = useAuthStore();

  // Re-verify session and fetch profile logs if JWT is present in storage
  useEffect(() => {
    if (token) {
      loadUser();
    }
  }, [token, loadUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Screens */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Dashboard Workspaces */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dynamically loads corresponding Dashboard based on Role */}
          <Route index element={<RoleDashboardRouter />} />
          <Route path="drives" element={<Drives />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch-all Not Found Route */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
