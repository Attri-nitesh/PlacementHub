import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Briefcase,
  Users,
  Megaphone,
  BarChart3,
  Bell,
  Activity,
  Award,
  Video,
  ShieldAlert,
} from 'lucide-react';

const PlacementLayout = ({ children, activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'drives', label: 'Placement Drives', icon: Calendar },
    { id: 'applications', label: 'Applications Screening', icon: Briefcase },
    { id: 'interviews', label: 'Interviews', icon: Video },
    { id: 'offers', label: 'Offers & Rejections', icon: Award },
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'logs', label: 'Activity Logs', icon: Activity },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col selection:bg-amber-500/30">
      {/* Dedicated Placement Officer Navbar */}
      <Navbar onNavigateTab={onTabChange} />

      {/* Main Container */}
      <div className="flex-1 w-full flex flex-col md:flex-row gap-6 px-6 sm:px-8 py-6">
        {/* Dedicated Placement Officer Sidebar */}
        <Sidebar
          items={sidebarItems}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onLogout={logout}
          role="placement"
        />

        {/* Portal Content Pane */}
        <main className="flex-1 space-y-6">
          {/* Breadcrumb Header */}
          <div className="flex items-center justify-between px-2 text-xs text-slate-400 border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-200 uppercase tracking-wider">Placement Officer Portal</span>
              <span>/</span>
              <span className="capitalize font-semibold text-amber-400">
                {activeTab.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono font-semibold text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Officer Session</span>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
};

export default PlacementLayout;
