import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminDashboard from '../pages/AdminDashboard';
import AdminLoginPage from '../pages/AdminLoginPage';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Admin Login Route */}
      <Route path="/login" element={<AdminLoginPage />} />

      {/* Admin Dashboard Protected Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-All Admin Redirect */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
