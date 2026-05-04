'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  prioridad: 'low' | 'medium' | 'high' | 'urgent';
  leida: boolean;
  archivada: boolean;
  datos?: any;
  creadoEn: string;
  actualizadoEn?: string;
}

function normalizeNotification(n: any): Notification {
  return {
    ...n,
    leida: n.leida ?? n.leido ?? false,
    actualizadoEn: n.actualizadoEn ?? n.creadoEn,
  };
}

interface UseNotificationsReturn {
  notifications: Notification[];
  archivedNotifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isLoadingArchived: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  fetchArchived: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAsUnread: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (id: number) => Promise<void>;
  unarchiveNotification: (id: number) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [archivedNotifications, setArchivedNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar notificaciones');
      }

      const data = await response.json();
      setNotifications(data.map(normalizeNotification));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const count = await response.json();
      setUnreadCount(count);
    } catch {
      // Silently ignore network errors (backend restarting, offline, etc.)
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leido: true }),
      });

      if (!response.ok) {
        throw new Error('Error al marcar como leída');
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  }, [toast]);

  const markAllAsRead = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const unreadIds = notifications.filter((n) => !n.leida).map((n) => n.id);
      
      await Promise.all(
        unreadIds.map((id) =>
          fetch(`${API_URL}/api/notifications/${id}/read`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ leido: true }),
          })
        )
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
      setUnreadCount(0);

      toast({
        title: 'Éxito',
        description: 'Todas las notificaciones marcadas como leídas',
        variant: 'default',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  }, [notifications, toast]);

  const archiveNotification = useCallback(async (id: number) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/notifications/${id}/archive`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al archivar');
      }

      const archived = notifications.find((n) => n.id === id);
      if (archived) {
        setArchivedNotifications((prev) => [archived, ...prev]);
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));

      const wasUnread = notifications.find((n) => n.id === id && !n.leida);
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  }, [notifications, toast]);

  const unarchiveNotification = useCallback(async (id: number) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/notifications/${id}/unarchive`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al desarchivar');
      }

      const unarchived = archivedNotifications.find((n) => n.id === id);
      if (unarchived) {
        setNotifications((prev) => [unarchived, ...prev]);
      }
      setArchivedNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  }, [archivedNotifications, toast]);

  const markAsUnread = useCallback(async (id: number) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/notifications/${id}/unread`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al marcar como no leída');
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  }, [toast]);

  const fetchArchived = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setIsLoadingArchived(true);
    try {
      const response = await fetch(`${API_URL}/api/notifications/archived`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar notificaciones archivadas');
      }

      const data = await response.json();
      setArchivedNotifications(data.map(normalizeNotification));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingArchived(false);
    }
  }, []);

  const deleteNotification = useCallback(async (id: number) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setArchivedNotifications((prev) => prev.filter((n) => n.id !== id));

      const wasUnread = notifications.find((n) => n.id === id && !n.leida);
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      toast({
        title: 'Notificación eliminada',
        description: 'La notificación ha sido eliminada permanentemente',
        variant: 'default',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  }, [notifications, toast]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount, fetchNotifications]);

  return {
    notifications,
    archivedNotifications,
    unreadCount,
    isLoading,
    isLoadingArchived,
    error,
    fetchNotifications,
    fetchArchived,
    fetchUnreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    archiveNotification,
    unarchiveNotification,
    deleteNotification,
  };
}
