import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from '../services/notificationApi';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  LogOut,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Check,
  Briefcase,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const Navbar = ({ onNavigateTab }) => {
  const { user, logout } = useAuth();
  const { unreadCount, setUnreadCount } = useSocket();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const dropdownRef = useRef(null);

  if (!user) return null;

  const isStudent = user.role === 'student';

  const fetchDropdownNotifs = async () => {
    try {
      const data = await getUserNotifications({ limit: 10 });
      setNotifications(data.notifications || []);
      if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch dropdown notifications:', err);
    }
  };

  useEffect(() => {
    if (dropdownOpen) {
      fetchDropdownNotifs();
    }
  }, [dropdownOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    setDropdownOpen(false);

    if (!notif.isRead) {
      try {
        await markNotificationRead(notif._id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {}
    }

    if (notif.actionUrl) {
      try {
        const urlObj = new URL(notif.actionUrl, window.location.origin);
        const tabParam = urlObj.searchParams.get('tab');

        if (onNavigateTab && tabParam) {
          onNavigateTab(tabParam);
        }
      } catch (e) {}
      navigate(notif.actionUrl);
    } else {
      const defaultPath = isStudent ? '/student/dashboard?tab=applications' : '/placement/dashboard?tab=applications';
      navigate(defaultPath);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Offer':
        return <Award className="w-4 h-4 text-emerald-400" />;
      case 'Interview':
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'Application':
        return <Briefcase className="w-4 h-4 text-blue-400" />;
      case 'Warning':
      case 'Error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'Success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-violet-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0F17] border-b border-slate-800 px-6 sm:px-8 py-3.5 shadow-md">
      <div className="w-full flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate(isStudent ? '/student/dashboard' : '/placement/dashboard')}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 p-0.5 shadow-md">
            <div className="w-full h-full bg-[#0B0F17] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-white leading-none">
              Placement<span className="text-violet-400">Hub</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-1">
              Campus Recruitment Platform
            </span>
          </div>
        </div>

        {/* User Actions & Notification Bell */}
        <div className="flex items-center space-x-4" ref={dropdownRef}>
          {/* Notification Bell Icon */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="relative p-2.5 rounded-2xl bg-[#161B26] hover:bg-[#1F2636] border border-slate-700/60 text-slate-300 hover:text-white transition-all duration-200"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white font-mono font-bold text-[10px] min-w-[18px] text-center shadow-lg border border-[#0B0F17]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Solid Opaque Notification Dropdown (NO Glassmorphism) */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-slate-700 bg-[#111622] shadow-2xl overflow-hidden z-50 flex flex-col max-h-[500px]"
                >
                  {/* Solid Header */}
                  <div className="p-4 border-b border-slate-800 bg-[#161B26] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-violet-400" />
                      <span className="font-bold text-white text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-violet-600/30 border border-violet-500/40 text-violet-300 text-[10px] font-bold">
                          {unreadCount} New
                        </span>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark All Read</span>
                      </button>
                    )}
                  </div>

                  {/* Opaque Dropdown Items List */}
                  <div className="p-2 space-y-1.5 overflow-y-auto flex-1 bg-[#111622]">
                    {notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                          notif.isRead
                            ? 'bg-[#161B26] border-slate-800 text-slate-300 hover:bg-[#1C2333] hover:border-slate-700'
                            : 'bg-[#1E1B2E] border-violet-500/40 text-white font-semibold hover:bg-[#25203B] shadow-md'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#0B0F17] border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                          {getTypeIcon(notif.type)}
                        </div>

                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-white text-xs leading-snug">{notif.title}</h5>
                            {!notif.isRead && <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{notif.message}</p>
                          <span className="text-[9px] text-slate-400 font-mono block pt-0.5">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}

                    {notifications.length === 0 && (
                      <div className="py-8 text-center text-slate-400 text-xs italic">
                        No notifications yet.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Badge */}
          <div className="hidden sm:flex items-center space-x-3 bg-[#161B26] border border-slate-700/60 rounded-full px-4 py-2">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-600"
              />
            ) : (
              <div className={`w-2.5 h-2.5 rounded-full ${isStudent ? 'bg-emerald-400' : 'bg-violet-400'}`} />
            )}

            <div className="flex items-center space-x-2">
              {isStudent ? (
                <UserCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-violet-400" />
              )}
              <span className="text-sm font-semibold text-slate-100">{user.name}</span>
            </div>

            <span className="text-slate-700">|</span>

            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                isStudent
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              }`}
            >
              {isStudent ? 'Student' : 'Placement Cell'}
            </span>
          </div>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={logout}
            className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all duration-200 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
