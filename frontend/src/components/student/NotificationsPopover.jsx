import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationsRead, deleteNotification } from '../../services/studentApi';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, Calendar, Sparkles, AlertCircle, Info } from 'lucide-react';

const NotificationsPopover = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async () => {
    try {
      await markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-slate-900/60 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <span>Campus & Placement Alerts</span>
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold animate-pulse">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Real-time updates regarding company drives, test links, and interview schedules.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkRead}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {notifications.map((notif) => (
          <motion.div
            key={notif._id}
            layout
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border transition-all ${
              notif.isRead
                ? 'bg-white/5 border-white/5 opacity-80'
                : 'bg-amber-500/10 border-amber-500/30 shadow-md'
            } flex items-start justify-between gap-4`}
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                {notif.type === 'Drive' ? (
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                ) : notif.type === 'Deadline' ? (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <Info className="w-5 h-5 text-amber-400" />
                )}
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">{notif.title}</h4>
                <p className="text-xs text-slate-300">{notif.message}</p>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleDelete(notif._id)}
              className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}

        {notifications.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs italic">
            No campus placement notifications yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPopover;
