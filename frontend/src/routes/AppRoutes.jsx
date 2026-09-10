import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import StudentRoutes from './StudentRoutes';
import PlacementRoutes from './PlacementRoutes';
import AdminRoutes from './AdminRoutes';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Student Portal Sub-Router (/student/*) */}
      <Route path="/student/*" element={<StudentRoutes />} />

      {/* Placement Cell Portal Sub-Router (/placement/*) */}
      <Route path="/placement/*" element={<PlacementRoutes />} />

      {/* Super Admin Portal Sub-Router (/admin/*) */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Legacy Settings Redirect */}
      <Route path="/settings" element={<Navigate to="/student/dashboard?tab=settings" replace />} />

      {/* Fallback Catch-All Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
