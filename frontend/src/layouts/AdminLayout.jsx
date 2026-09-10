import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  UserCheck,
  Users,
  Building2,
  BarChart3,
  FileCheck,
  Sliders,
  Bell,
  LogOut,
  Crown,
  ShieldCheck,
  User,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const AdminLayout = ({ children, activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1400 && window.innerWidth >= 1100);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 1400) {
        setCollapsed(false);
      } else if (w >= 1100) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const settingsItem = { id: 'settings', label: 'System Settings', icon: Sliders };
  const mainSidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'colleges', label: 'College Management', icon: GraduationCap },
    { id: 'officers', label: 'Placement Officers', icon: UserCheck },
    { id: 'students', label: 'Student Management', icon: Users },
    { id: 'companies', label: 'Company Management', icon: Building2 },
    { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
    { id: 'logs', label: 'Audit Logs', icon: FileCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleTabSelect = (tabId) => {
    onTabChange(tabId);
    setMobileDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col selection:bg-rose-500/30 overflow-x-hidden">
      {/* Top Bar / Header */}
      <header className="w-full bg-[#111622] border-b border-rose-500/20 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xl">
        {/* Left Brand & Mobile Menu Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 block lg:hidden transition-colors"
            title="Toggle Navigation Menu"
          >
            {mobileDrawerOpen ? <X className="w-5 h-5 text-rose-400" /> : <Menu className="w-5 h-5 text-rose-400" />}
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-red-600 to-pink-600 p-0.5 shadow-glow-rose flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
                <Crown className="w-4 h-4 text-rose-400" />
              </div>
            </div>
            <div className="hidden xs:block">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white block leading-none font-['Plus_Jakarta_Sans']">
                Placement<span className="text-rose-400">Hub</span>
              </span>
              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider block mt-0.5">
                Super Admin Workspace
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center space-x-2.5 sm:space-x-4">
          {/* Badge: SUPER ADMIN */}
          <div className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-extrabold font-mono shadow-sm shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>SUPER ADMIN</span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => handleTabSelect('notifications')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors relative shrink-0"
            title="Admin System Notifications"
          >
            <Bell className="w-4 h-4 text-rose-400" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </button>

          {/* Admin Profile */}
          <div className="flex items-center space-x-2.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs shrink-0">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden md:block text-left">
              <span className="font-bold text-white block leading-tight font-['Plus_Jakarta_Sans']">
                {user?.name || 'Super Administrator'}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                {user?.email || 'admin@placementhub.com'}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs flex items-center space-x-1.5 transition-all shrink-0"
            title="Sign out of Admin Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="flex-1 w-full max-w-full flex min-w-0 relative">
        {/* Mobile Backdrop Overlay */}
        {mobileDrawerOpen && (
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          />
        )}

        {/* Dedicated Admin Sidebar (Desktop & Laptop) */}
        <aside
          className={`hidden lg:flex flex-col justify-start shrink-0 border-r border-[#222B3D] bg-[#101622] transition-all duration-300 sticky top-[61px] h-[calc(100vh-61px)] p-3 ${
            collapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="space-y-3">
            <div className={`px-2 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
              {!collapsed && <span>System Navigation</span>}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-rose-400" /> : <ChevronLeft className="w-3.5 h-3.5 text-rose-400" />}
              </button>
            </div>

            <nav className="space-y-1">
              {mainSidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabSelect(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full py-2.5 rounded-2xl text-xs font-bold flex items-center transition-all ${
                      collapsed ? 'justify-center px-0' : 'px-3.5 space-x-3'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-glow-rose border border-rose-400/40'
                        : 'text-[#91A0B8] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-rose-400'}`} />
                    {!collapsed && <span className="truncate font-['Inter']">{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Divider & Grouped Settings + Logout */}
          <div className="border-t border-[#222B3D] my-3.5" />
          <div className="space-y-1">
            <button
              onClick={() => handleTabSelect(settingsItem.id)}
              title={collapsed ? settingsItem.label : undefined}
              className={`w-full py-2.5 rounded-2xl text-xs font-bold flex items-center transition-all ${
                collapsed ? 'justify-center px-0' : 'px-3.5 space-x-3'
              } ${
                activeTab === settingsItem.id
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-glow-rose border border-rose-400/40'
                  : 'text-[#91A0B8] hover:bg-white/5 hover:text-white'
              }`}
            >
              <settingsItem.icon className={`w-4 h-4 shrink-0 ${activeTab === settingsItem.id ? 'text-white' : 'text-rose-400'}`} />
              {!collapsed && <span className="truncate font-['Inter']">{settingsItem.label}</span>}
            </button>

            <button
              onClick={handleLogout}
              title={collapsed ? 'Sign Out' : undefined}
              className={`w-full py-2.5 rounded-2xl text-xs font-bold flex items-center text-[#FF6B6B] hover:bg-[#FF6B6B]/10 transition-all ${
                collapsed ? 'justify-center px-0' : 'px-3.5 space-x-3'
              }`}
            >
              <LogOut className="w-4 h-4 text-[#FF6B6B] shrink-0" />
              {!collapsed && <span className="font-['Inter']">Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Slide-Out Drawer Sidebar (Mobile & Tablet <1100px) */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-[#222B3D] bg-[#101622] p-4 flex flex-col justify-start transform transition-transform duration-300 lg:hidden shadow-2xl ${
            mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#222B3D] pb-3">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-rose-400" />
                <span className="font-extrabold text-white text-base font-['Plus_Jakarta_Sans']">Navigation Menu</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="space-y-1">
              {mainSidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabSelect(item.id)}
                    className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-3 transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-glow-rose border border-rose-400/40'
                        : 'text-[#91A0B8] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-rose-400'}`} />
                    <span className="font-['Inter']">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-[#222B3D] my-3.5" />
          <div className="space-y-1">
            <button
              onClick={() => handleTabSelect(settingsItem.id)}
              className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-3 transition-all ${
                activeTab === settingsItem.id
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-glow-rose border border-rose-400/40'
                  : 'text-[#91A0B8] hover:bg-white/5 hover:text-white'
              }`}
            >
              <settingsItem.icon className={`w-4 h-4 shrink-0 ${activeTab === settingsItem.id ? 'text-white' : 'text-rose-400'}`} />
              <span className="font-['Inter']">{settingsItem.label}</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-3 text-[#FF6B6B] hover:bg-[#FF6B6B]/10 transition-all"
            >
              <LogOut className="w-4 h-4 text-[#FF6B6B] shrink-0" />
              <span className="font-['Inter'] font-semibold">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Breadcrumb Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-400 border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-200 uppercase tracking-wider">Super Admin Portal</span>
              <span>/</span>
              <span className="capitalize font-semibold text-rose-400">
                {activeTab.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono font-semibold text-[11px] shrink-0">
              <Crown className="w-3.5 h-3.5 text-rose-400" />
              <span>Super Administrator</span>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
