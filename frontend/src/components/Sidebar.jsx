import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { 
  LayoutDashboard, 
  Briefcase, 
  BarChart3, 
  UserCircle, 
  LogOut, 
  GraduationCap, 
  ShieldAlert, 
  Building2 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleIcon = () => {
    if (user?.role === 'admin') return <ShieldAlert className="h-4 w-4 text-rose-500" />;
    if (user?.role === 'recruiter') return <Building2 className="h-4 w-4 text-emerald-500" />;
    return <GraduationCap className="h-4 w-4 text-blue-500" />;
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: 'Placement Drives',
      path: '/drives',
      icon: <Briefcase className="h-5 w-5" />
    },
    {
      name: 'Analytics Insights',
      path: '/analytics',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      name: 'My Profile',
      path: '/profile',
      icon: <UserCircle className="h-5 w-5" />
    }
  ];

  return (
    <aside className="fixed bottom-0 top-0 left-0 z-20 flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md transition-transform">
      {/* Title Header */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 dark:border-slate-800 px-6">
        <GraduationCap className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          PlacementHub
        </span>
      </div>

      {/* User Card info */}
      <div className="mx-4 my-4 flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold text-sm">
          {user?.name ? user.name[0] : 'U'}
        </div>
        <div className="overflow-hidden">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.name}</p>
          <div className="mt-0.5 flex items-center gap-1">
            {getRoleIcon()}
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Main Nav Links */}
      <nav className="flex-1 space-y-1.5 px-4 py-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm border-l-4 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Logout Footer button */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
