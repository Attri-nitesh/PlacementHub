import { create } from 'zustand';
import api from '../services/api';
import { io } from 'socket.io-client';

const useNotifStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  socket: null,
  toast: null, // holds current active visual alert: { title, message, type }

  // Load user's notification list
  fetchNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        const notifs = res.data.data;
        const unread = notifs.filter(n => !n.read).length;
        set({ notifications: notifs, unreadCount: unread });
      }
    } catch (err) {
      console.error('Failed to fetch notifications list:', err);
    }
  },

  // Mark notification read
  markAsRead: async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      if (res.data.success) {
        set((state) => {
          const updated = state.notifications.map(n => n._id === id ? { ...n, read: true } : n);
          return {
            notifications: updated,
            unreadCount: Math.max(0, state.unreadCount - 1)
          };
        });
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  },

  // Trigger floating visual Toast alert UI
  showToast: (title, message, type = 'info') => {
    set({ toast: { title, message, type } });
    setTimeout(() => {
      // Automatic dimming after 4 seconds
      if (get().toast && get().toast.message === message) {
        set({ toast: null });
      }
    }, 4000);
  },

  clearToast: () => set({ toast: null }),

  // Initialize Socket.io client bindings
  initSocket: (token) => {
    if (get().socket) return; // Prevent duplicate socket clients

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socketInstance = io(socketUrl, {
      auth: { token }
    });

    socketInstance.on('connect', () => {
      console.log('Socket.io: Connection active.');
    });

    const handleLiveNotification = (data) => {
      // Insert new notification locally
      set((state) => {
        const incoming = {
          _id: data.notificationId || Math.random().toString(),
          title: data.title,
          message: data.message,
          type: data.type || 'system',
          read: false,
          createdAt: new Date().toISOString()
        };
        return {
          notifications: [incoming, ...state.notifications],
          unreadCount: state.unreadCount + 1
        };
      });

      // Present visual Toast popup
      let statusType = 'info';
      if (data.type === 'status_update') statusType = 'success';
      if (data.type === 'reminder') statusType = 'warning';
      get().showToast(data.title, data.message, statusType);
    };

    // Live Socket listener routes
    socketInstance.on('new_drive', handleLiveNotification);
    socketInstance.on('status_update', handleLiveNotification);
    socketInstance.on('deadline_reminder', handleLiveNotification);

    // Recruiter specific shortlist event
    socketInstance.on('shortlist_notification', (data) => {
      get().showToast('Shortlisted!', data.message, 'success');
    });

    set({ socket: socketInstance });
  },

  // Terminate Socket client
  disconnectSocket: () => {
    const socketInstance = get().socket;
    if (socketInstance) {
      socketInstance.disconnect();
      set({ socket: null });
    }
  }
}));

export default useNotifStore;
