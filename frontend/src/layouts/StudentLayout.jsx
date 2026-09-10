import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  Calendar,
  Layers,
  Bell,
  BarChart3,
  Settings,
} from 'lucide-react';

const StudentLayout = ({ children, activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'resume', label: 'Resume Vault', icon: FileText },
    { id: 'skills_projects', label: 'Skills & Projects', icon: Layers },
    { id: 'drives', label: 'Placement Drives', icon: Calendar },
    { id: 'applications', label: 'Application Kanban', icon: Briefcase },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col selection:bg-emerald-500/30">
      {/* Dedicated Student Navbar */}
      <Navbar onNavigateTab={onTabChange} />

      {/* Main Container */}
      <div className="flex-1 w-full flex flex-col md:flex-row gap-6 px-6 sm:px-8 py-6">
        {/* Dedicated Student Sidebar */}
        <Sidebar
          items={sidebarItems}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onLogout={logout}
          role="student"
        />

        {/* Portal Content Pane */}
        <main className="flex-1 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
