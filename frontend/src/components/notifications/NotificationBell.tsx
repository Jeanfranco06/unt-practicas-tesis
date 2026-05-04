'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  Archive,
  CheckCheck,
  Clock,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const getNotificationIcon = (tipo: string, prioridad: string) => {
  const colorClass =
    prioridad === 'urgent'
      ? 'text-red-500'
      : prioridad === 'high'
      ? 'text-amber-500'
      : prioridad === 'medium'
      ? 'text-blue-500'
      : 'text-slate-500';

  switch (tipo) {
    case 'application_approved':
    case 'hours_approved':
    case 'practice_completed':
      return <CheckCircle className={`w-5 h-5 ${colorClass}`} />;
    case 'application_rejected':
    case 'hours_rejected':
      return <X className={`w-5 h-5 ${colorClass}`} />;
    case 'deadline_reminder':
      return <Clock className={`w-5 h-5 ${colorClass}`} />;
    case 'new_application':
    case 'new_application_to_offer':
    case 'practice_pending_advisor':
    case 'practice_assigned':
      return <Bell className={`w-5 h-5 ${colorClass}`} />;
    case 'system_alert':
      return <AlertCircle className={`w-5 h-5 ${colorClass}`} />;
    default:
      return <Info className={`w-5 h-5 ${colorClass}`} />;
  }
};

const getNotificationLink = (tipo: string, datos?: any): string | null => {
  switch (tipo) {
    case 'application_approved':
    case 'application_rejected':
      return '/dashboard/internships';
    case 'advisor_assigned':
      return '/dashboard/internships';
    case 'new_application':
    case 'practice_pending_advisor':
      return '/dashboard/coordinator';
    case 'practice_assigned':
      return '/dashboard/advisor';
    case 'new_application_to_offer':
    case 'new_offer_created':
    case 'offer_published':
      return '/dashboard/company/applications';
    case 'hours_pending_company_approval':
      return '/dashboard/company';
    default:
      return null;
  }
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { role } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    archiveNotification,
  } = useNotifications();

  // Ruta de notificaciones según el rol
  const notificationsPage = role === 'RepresentanteEmpresa' 
    ? '/dashboard/company/notifications' 
    : '/dashboard/notifications';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.leida) {
      await markAsRead(notification.id);
    }
  };

  const recentNotifications = notifications.slice(0, 10);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
              <div>
                <h3 className="font-semibold text-foreground">Notificaciones</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} sin leer
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs h-8"
                  >
                    <CheckCheck className="w-4 h-4 mr-1" />
                    Marcar todas
                  </Button>
                )}
                <Link href={notificationsPage}>
                  <Button variant="ghost" size="sm" className="text-xs h-8">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                  <p className="mt-2 text-sm">Cargando...</p>
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No tienes notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentNotifications.map((notification) => {
                    const link = getNotificationLink(notification.tipo, notification.datos);
                    const content = (
                      <div
                        className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                          !notification.leida ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getNotificationIcon(notification.tipo, notification.prioridad)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-medium ${!notification.leida ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.titulo}
                              </p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(notification.creadoEn).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.mensaje}
                            </p>
                            {!notification.leida && (
                              <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2" />
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveNotification(notification.id);
                            }}
                            className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Archivar"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );

                    return link ? (
                      <Link
                        key={notification.id}
                        href={link}
                        onClick={() => setIsOpen(false)}
                        className="block group"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div key={notification.id} className="group">
                        {content}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {recentNotifications.length > 0 && (
              <div className="p-3 border-t border-border bg-muted/50 text-center">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-primary hover:underline"
                >
                  Ver todas las notificaciones
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
