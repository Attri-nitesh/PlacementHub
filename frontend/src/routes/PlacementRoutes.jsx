import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PlacementDashboard from '../pages/PlacementDashboard';

const PlacementRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRole="placement">
            <PlacementDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/placement/dashboard" replace />} />
    </Routes>
  );
};

export default PlacementRoutes;
