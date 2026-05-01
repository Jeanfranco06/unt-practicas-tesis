'use client';

import { useState } from 'react';
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
  Filter,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';

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
      return <CheckCircle className={`w-6 h-6 ${colorClass}`} />;
    case 'application_rejected':
    case 'hours_rejected':
      return <X className={`w-6 h-6 ${colorClass}`} />;
    case 'deadline_reminder':
      return <Clock className={`w-6 h-6 ${colorClass}`} />;
    case 'new_application':
    case 'new_application_to_offer':
    case 'practice_pending_advisor':
    case 'practice_assigned':
      return <Bell className={`w-6 h-6 ${colorClass}`} />;
    case 'system_alert':
      return <AlertCircle className={`w-6 h-6 ${colorClass}`} />;
    default:
      return <Info className={`w-6 h-6 ${colorClass}`} />;
  }
};

const getNotificationTypeLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    application_approved: 'Postulación Aprobada',
    application_rejected: 'Postulación Rechazada',
    advisor_assigned: 'Asesor Asignado',
    hours_approved: 'Horas Aprobadas',
    hours_rejected: 'Horas Rechazadas',
    report_evaluated: 'Informe Evaluado',
    practice_completed: 'Práctica Completada',
    deadline_reminder: 'Recordatorio de Fecha',
    new_application: 'Nueva Postulación',
    practice_pending_advisor: 'Práctica Pendiente de Asesor',
    report_pending_review: 'Informe Pendiente de Revisión',
    hours_pending_approval: 'Horas Pendientes de Aprobación',
    user_pending_approval: 'Usuario Pendiente de Aprobación',
    practice_assigned: 'Nueva Práctica Asignada',
    hours_pending_advisor_approval: 'Horas Pendientes de Aprobación',
    report_pending_advisor_review: 'Informe Pendiente de Revisión',
    hours_pending_company_approval: 'Horas Pendientes de Aprobación',
    final_evaluation_pending: 'Evaluación Final Pendiente',
    new_application_to_offer: 'Nueva Postulación a Oferta',
    new_offer_created: 'Oferta Creada',
    offer_published: 'Oferta Publicada',
    new_agreement: 'Nuevo Convenio',
    user_pending_admin_approval: 'Usuario Pendiente de Aprobación',
    system_alert: 'Alerta del Sistema',
  };
  return labels[tipo] || tipo;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.leida;
    if (filter === 'read') return n.leida;
    return true;
  });

  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.leida).length,
    read: notifications.filter((n) => n.leida).length,
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notificaciones</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestiona tus notificaciones y mantente al día
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            className="text-muted-foreground"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualizar
          </Button>
          {unreadCount > 0 && (
            <Button
              size="sm"
              onClick={markAllAsRead}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-primary' },
          { label: 'Sin leer', value: stats.unread, color: 'bg-amber-500' },
          { label: 'Leídas', value: stats.read, color: 'bg-emerald-500' },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => {
              if (stat.label === 'Total') setFilter('all');
              else if (stat.label === 'Sin leer') setFilter('unread');
              else if (stat.label === 'Leídas') setFilter('read');
            }}
            className={`p-4 bg-card rounded-xl border transition-all ${
              (filter === 'all' && stat.label === 'Total') ||
              (filter === 'unread' && stat.label === 'Sin leer') ||
              (filter === 'read' && stat.label === 'Leídas')
                ? 'border-primary shadow-soft'
                : 'border-border hover:border-border/60'
            }`}
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color.replace('bg-', 'text-')}`}>
              {stat.value}
            </p>
          </button>
        ))}
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={itemVariants} className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="flex gap-1">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'unread', label: 'Sin leer' },
            { key: 'read', label: 'Leídas' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                filter === f.key
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notifications List */}
      <motion.div variants={itemVariants} className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground mt-4">Cargando notificaciones...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">No hay notificaciones</p>
            <p className="text-sm mt-2">
              {filter === 'unread'
                ? 'No tienes notificaciones sin leer'
                : filter === 'read'
                ? 'No tienes notificaciones leídas'
                : 'No tienes notificaciones'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -100 }}
                className={`p-4 bg-card rounded-xl border transition-all ${
                  !notification.leida
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    {getNotificationIcon(notification.tipo, notification.prioridad)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                          {getNotificationTypeLabel(notification.tipo)}
                        </span>
                        <h3
                          className={`font-semibold ${
                            !notification.leida ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {notification.titulo}
                        </h3>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(notification.creadoEn).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.mensaje}
                    </p>
                    {notification.datos && Object.keys(notification.datos).length > 0 && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(notification.datos, null, 2)}
                        </pre>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      {!notification.leida && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs h-7 text-primary"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Marcar como leída
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => archiveNotification(notification.id)}
                        className="text-xs h-7 text-muted-foreground hover:text-foreground"
                      >
                        <Archive className="w-3 h-3 mr-1" />
                        Archivar
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  );
}
