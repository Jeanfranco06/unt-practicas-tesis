'use client';

import { useEffect, useState } from 'react';
import { NotificationsDropdown } from './NotificationsDropdown';
import { Notification, NotificationType } from '@/types/notifications';
import { getPendingAdvisors } from '@/app/dashboard/users/_lib/users';
import { useAuth } from '@/hooks/useAuth';

export function NotificationsBadge() {
  const { role } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Solo cargar notificaciones si es administrador
    if (role === 'Administrador') {
      loadNotifications();
    } else {
      setIsLoading(false);
    }
  }, [role]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(false);
      const advisors = await getPendingAdvisors();
      
      // Convertir asesores pendientes a notificaciones
      const advisorNotifications: Notification[] = advisors.map((advisor) => ({
        id: `advisor-${advisor.id}`,
        type: NotificationType.USER_APPROVAL,
        message: `${advisor.nombre} ${advisor.apellidoPaterno} solicita aprobación`,
        description: 'Asesor pendiente de aprobación',
        createdAt: new Date().toISOString(),
        isRead: false,
        actionUrl: '/dashboard/users',
        metadata: { userId: advisor.id },
      }));

      setNotifications(advisorNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError(true);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // No mostrar si no es admin
  if (role !== 'Administrador') {
    return null;
  }

  return (
    <NotificationsDropdown
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
    />
  );
}
