'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, ArrowLeft, AlertCircle, CheckCircle, Info, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'exito' | 'advertencia' | 'error';
  leido: boolean;
  creadoEn: string;
}

const tipoConfig = {
  info: { 
    icon: Info, 
    color: 'text-blue-600 dark:text-blue-400', 
    bg: 'bg-blue-100 dark:bg-blue-500/20',
    border: 'border-blue-200 dark:border-blue-500/30',
    label: 'Información'
  },
  exito: { 
    icon: CheckCircle, 
    color: 'text-emerald-600 dark:text-emerald-400', 
    bg: 'bg-emerald-100 dark:bg-emerald-500/20',
    border: 'border-emerald-200 dark:border-emerald-500/30',
    label: 'Éxito'
  },
  advertencia: { 
    icon: AlertTriangle, 
    color: 'text-amber-600 dark:text-amber-400', 
    bg: 'bg-amber-100 dark:bg-amber-500/20',
    border: 'border-amber-200 dark:border-amber-500/30',
    label: 'Advertencia'
  },
  error: { 
    icon: AlertCircle, 
    color: 'text-red-600 dark:text-red-400', 
    bg: 'bg-red-100 dark:bg-red-500/20',
    border: 'border-red-200 dark:border-red-500/30',
    label: 'Error'
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/notifications`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/notifications/${id}/read`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, leido: true } : n))
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.leido);
    await Promise.all(unread.map((n) => markAsRead(n.id)));
  };

  const deleteNotification = async (id: number) => {
    // TODO: Implementar endpoint de eliminación en backend
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.leido;
    if (filter === 'read') return n.leido;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.leido).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-muted rounded-xl animate-pulse" />
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <Link href="/student/dashboard">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notificaciones</h1>
          <p className="text-muted-foreground text-sm">
            {unreadCount > 0
              ? `Tienes ${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} sin leer`
              : 'Todas las notificaciones han sido leídas'}
          </p>
        </div>
      </motion.div>

      {/* Filters & Actions */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2 p-1 bg-muted rounded-xl">
          <Button
            variant={filter === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            className="rounded-lg"
          >
            Todas
            <span className="ml-2 text-xs bg-muted-foreground/20 px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          </Button>
          <Button
            variant={filter === 'unread' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unread')}
            className="rounded-lg"
          >
            No leídas
            {unreadCount > 0 && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </Button>
          <Button
            variant={filter === 'read' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('read')}
            className="rounded-lg"
          >
            Leídas
          </Button>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <Check className="w-4 h-4 mr-2" />
            Marcar todo como leído
          </Button>
        )}
      </motion.div>

      {/* Notifications List */}
      <motion.div variants={itemVariants} className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              No hay notificaciones
            </h3>
            <p className="text-muted-foreground">
              {filter === 'unread'
                ? 'No tienes notificaciones sin leer'
                : filter === 'read'
                ? 'No hay notificaciones leídas'
                : 'Aún no has recibido ninguna notificación'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const config = tipoConfig[notification.tipo] || tipoConfig.info;
            const Icon = config.icon;

            return (
              <motion.div
                key={notification.id}
                variants={itemVariants}
                className={cn(
                  'p-4 sm:p-5 rounded-2xl border transition-all duration-200',
                  'hover:shadow-soft hover:border-primary/20',
                  notification.leido
                    ? 'bg-card border-border'
                    : 'bg-primary/5 border-primary/20'
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                      config.bg,
                      config.border,
                      'border'
                    )}
                  >
                    <Icon className={cn('w-6 h-6', config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-0.5 rounded-full',
                              config.bg,
                              config.color
                            )}
                          >
                            {config.label}
                          </span>
                          {!notification.leido && (
                            <span className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <h3
                          className={cn(
                            'font-semibold text-foreground',
                            !notification.leido && 'text-foreground'
                          )}
                        >
                          {notification.titulo}
                        </h3>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                        {formatDate(notification.creadoEn)}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                      {notification.mensaje}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-muted-foreground sm:hidden">
                        {formatDate(notification.creadoEn)}
                      </span>
                      <div className="flex items-center gap-2 ml-auto">
                        {!notification.leido && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-8 text-xs"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Marcar como leído
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}
