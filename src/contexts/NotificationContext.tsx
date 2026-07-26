import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppNotification } from '../types';
import { db } from '../services/db';
import toast, { Toaster } from 'react-hot-toast';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (type: AppNotification['type'], title: string, message: string, referenceId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const loadNotifications = () => {
    db.refreshNotificationsAndAlerts();
    const list = db.getNotifications();
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();

    // Set a periodic checker or initial check to toast critical notifications!
    const list = db.getNotifications();
    const unreadCriticals = list.filter(n => !n.read && (n.title.includes('Crítico') || n.title.includes('EXPIRED') || n.title.includes('EXPIRADO')));
    
    if (unreadCriticals.length > 0) {
      setTimeout(() => {
        unreadCriticals.slice(0, 2).forEach(n => {
          toast.error(`${n.title}: ${n.message}`, {
            duration: 6000,
            icon: '⚠️',
          });
        });
      }, 1000);
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    const list = db.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
    db.saveNotifications(list);
    setNotifications(list);
  };

  const markAllAsRead = () => {
    const list = db.getNotifications().map(n => ({ ...n, read: true }));
    db.saveNotifications(list);
    setNotifications(list);
    toast.success('Todas as notificações foram marcadas como lidas.');
  };

  const addNotification = (type: AppNotification['type'], title: string, message: string, referenceId: string) => {
    const list = db.getNotifications();
    const newNot: AppNotification = {
      id: `not-${Date.now()}`,
      type,
      title,
      message,
      referenceId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [newNot, ...list];
    db.saveNotifications(updated);
    setNotifications(updated);
    toast(title, { icon: '🔔' });
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, addNotification }}>
      {children}
      <Toaster position="top-right" reverseOrder={false} />
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
