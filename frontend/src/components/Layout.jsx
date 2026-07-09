import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Toast from './Toast';
import useAuthStore from '../store/useAuthStore';
import useNotifStore from '../store/useNotifStore';

const Layout = () => {
  const { token, user } = useAuthStore();
  const { initSocket, disconnectSocket } = useNotifStore();
  const location = useLocation();

  // Socket management triggered by JWT token validation
  useEffect(() => {
    if (token) {
      initSocket(token);
    }
    return () => {
      disconnectSocket();
    };
  }, [token, initSocket, disconnectSocket]);

  // Derive title from active URL route path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return `${user?.role || 'User'} Dashboard`;
    if (path === '/drives') return 'Placement Drives';
    if (path === '/analytics') return 'Analytics & Insights';
    if (path === '/profile') return 'My Profile Details';
    return 'PlacementHub';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar - fixed width left panel */}
      <Sidebar />

      {/* Main viewport panels */}
      <div className="flex flex-1 flex-col pl-64">
        {/* Navbar */}
        <Navbar title={getPageTitle()} />

        {/* Content canvas */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Floating Toast alerts container */}
      <Toast />
    </div>
  );
};

export default Layout;
