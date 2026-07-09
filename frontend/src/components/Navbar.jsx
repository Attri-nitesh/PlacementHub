import React, { useState, useEffect, useRef } from 'react';
import useNotifStore from '../store/useNotifStore';
import ThemeToggle from './ThemeToggle';
import { Bell, Check, Calendar, FileText, BellRing, Info } from 'lucide-react';

const Navbar = ({ title = 'Dashboard' }) => {
  const { notifications, unreadCount, markAsRead, fetchNotifications } = useNotifStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications list when Navbar mounts
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close notifications dropdown if clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'drive':
        return <Calendar className="h-4 w-4 text-emerald-500" />;
      case 'status_update':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'reminder':
        return <Info className="h-4 w-4 text-amber-500" />;
      default:
        return <BellRing className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 px-8 backdrop-blur-md transition-colors duration-200">
      <h2 className="text-lg font-bold text-slate-800 dark:text-white capitalize">{title}</h2>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        {/* Notification dropdown badge */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2.5 w-80 origin-top-right rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 shadow-xl ring-1 ring-black/5 focus:outline-none transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 px-3 mt-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                  Recent Alerts
                </span>
                {unreadCount > 0 && (
                  <span className="rounded bg-rose-100 dark:bg-rose-950/40 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-450">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto mt-2 space-y-1 scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`flex gap-3 rounded-lg p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors ${
                        !notif.read ? 'bg-slate-50/50 dark:bg-slate-900/20' : ''
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">{getNotificationIcon(notif.type)}</div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-start justify-between gap-1">
                          <p className={`text-xs font-semibold leading-snug ${!notif.read ? 'text-slate-950 dark:text-white' : 'text-slate-500'}`}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <button
                              onClick={() => markAsRead(notif._id)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded p-0.5 hover:bg-slate-100 dark:hover:bg-slate-850"
                              title="Mark as read"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-550 dark:text-slate-450 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[9px] text-slate-400 block mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
