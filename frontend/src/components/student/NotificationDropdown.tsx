'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, AlertCircle, CheckCircle, Info, AlertTriangle, ExternalLink } from 'lucide-react';
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
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/20' },
  exito: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
  advertencia: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-500/20' },
  error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-500/20' },
};

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.leido).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, leido: true } : n))
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.leido);
    await Promise.all(unread.map(n => markAsRead(n.id)));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-muted transition-colors"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background">
            <span className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute right-0 mt-2 w-80 sm:w-96 z-50',
                'bg-popover border border-border rounded-2xl shadow-elevated',
                'overflow-hidden'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h3 className="font-semibold text-foreground">Notificaciones</h3>
                  <p className="text-xs text-muted-foreground">
                    {unreadCount > 0
                      ? `${unreadCount} sin leer`
                      : 'Todas leídas'}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:text-primary"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Marcar todo
                  </Button>
                )}
              </div>

              {/* List */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Cargando...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      No hay notificaciones
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const config = tipoConfig[notification.tipo] || tipoConfig.info;
                    const Icon = config.icon;

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          'p-4 border-b border-border last:border-0',
                          'hover:bg-muted/50 transition-colors',
                          !notification.leido && 'bg-primary/5'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                              config.bg
                            )}
                          >
                            <Icon className={cn('w-4 h-4', config.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-sm font-medium',
                              !notification.leido ? 'text-foreground' : 'text-muted-foreground'
                            )}>
                              {notification.titulo}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {notification.mensaje}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground/60">
                                {formatDate(notification.creadoEn)}
                              </span>
                              {!notification.leido && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-6 px-2 text-xs text-primary hover:text-primary"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Leído
                                </Button>
                              )}
                            </div>
                          </div>
                          {!notification.leido && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-border bg-muted/30">
                <Link
                  href="/student/notificaciones"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center justify-center w-full py-2 px-3 rounded-lg',
                    'text-xs text-muted-foreground hover:text-foreground hover:bg-muted',
                    'transition-colors'
                  )}
                >
                  Ver todas las notificaciones
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
