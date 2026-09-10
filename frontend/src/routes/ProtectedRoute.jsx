import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center space-x-3">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <span className="text-sm font-semibold text-slate-400">Verifying Encrypted Session...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    if (allowedRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Strict Cross-Navigation Guard
  if (allowedRole) {
    const isExactRoleMatch = user.role === allowedRole;
    const isAdminUser = user.role === 'admin' || user.role === 'superadmin';

    // Admins can access everything. Non-admins cannot access outside their role portal.
    if (!isExactRoleMatch && !isAdminUser) {
      if (user.role === 'student') {
        return <Navigate to="/student/dashboard" replace />;
      } else if (user.role === 'placement') {
        return <Navigate to="/placement/dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
