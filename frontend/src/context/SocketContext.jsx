import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getUnreadCount } from '../services/notificationApi';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [realtimeNotification, setRealtimeNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = async () => {
    if (user?._id) {
      try {
        const data = await getUnreadCount();
        setUnreadCount(data.unreadCount || 0);
      } catch (err) {
        console.error('Failed to fetch unread notification count:', err);
      }
    }
  };

  useEffect(() => {
    fetchUnread();
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;

    const newSocket = io('http://localhost:5001', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    // Join room for user ID and role
    newSocket.emit('join_rooms', { userId: user._id, role: user.role });

    // Listener for incoming real-time notifications
    newSocket.on('notification_received', (notif) => {
      console.log('⚡ Real-Time Notification Received:', notif);
      setRealtimeNotification(notif);
      setUnreadCount((prev) => prev + 1);
    });

    newSocket.on('role_notification_received', (notif) => {
      console.log('⚡ Role Notification Received:', notif);
      setRealtimeNotification(notif);
      setUnreadCount((prev) => prev + 1);
    });

    newSocket.on('broadcast_notification', (notif) => {
      console.log('⚡ Broadcast Notification Received:', notif);
      setRealtimeNotification(notif);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        realtimeNotification,
        unreadCount,
        setUnreadCount,
        fetchUnread,
        clearNotification: () => setRealtimeNotification(null),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
