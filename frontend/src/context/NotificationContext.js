import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import AuthContext from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const { isAuthenticated, user } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });
    setSocket(newSocket);

    // Join user's room
    joinUserRoom(user.id);

    return () => newSocket.close();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!socket) return;

    // Listen for notifications
    socket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Show toast notification
      toast.success(notification.message, {
        duration: 5000,
        position: "top-right",
      });
    });

    return () => {
      socket.off('notification');
    };
  }, [socket]);

  // Fetch notifications when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  const joinUserRoom = (userId) => {
    if (socket) {
      socket.emit('join', userId);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping notification fetch');
        return;
      }

      const response = await api.get('/users/notifications');
      setNotifications(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('Unauthorized: Please log in again');
      } else {
        console.error('Error fetching notifications:', error);
      }
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/users/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        fetchNotifications,
        markAsRead,
        joinUserRoom
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}; 