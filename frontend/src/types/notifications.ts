export enum NotificationType {
  USER_APPROVAL = 'USER_APPROVAL',
  PRACTICE_REQUEST = 'PRACTICE_REQUEST',
  TESIS_UPDATE = 'TESIS_UPDATE',
  AGREEMENT_EXPIRATION = 'AGREEMENT_EXPIRATION',
  REPORT_GENERATED = 'REPORT_GENERATED',
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  description?: string;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export const notificationTypeConfig: Record<NotificationType, {
  icon: string;
  color: string;
  label: string;
  actionLabel: string;
}> = {
  [NotificationType.USER_APPROVAL]: {
    icon: 'UserCheck',
    color: 'bg-amber-500',
    label: 'Aprobación de Usuario',
    actionLabel: 'Revisar Usuarios',
  },
  [NotificationType.PRACTICE_REQUEST]: {
    icon: 'Briefcase',
    color: 'bg-blue-500',
    label: 'Solicitud de Práctica',
    actionLabel: 'Ver Prácticas',
  },
  [NotificationType.TESIS_UPDATE]: {
    icon: 'BookOpen',
    color: 'bg-purple-500',
    label: 'Actualización de Tesis',
    actionLabel: 'Ver Tesis',
  },
  [NotificationType.AGREEMENT_EXPIRATION]: {
    icon: 'AlertCircle',
    color: 'bg-red-500',
    label: 'Vencimiento de Convenio',
    actionLabel: 'Ver Convenios',
  },
  [NotificationType.REPORT_GENERATED]: {
    icon: 'FileText',
    color: 'bg-emerald-500',
    label: 'Reporte Generado',
    actionLabel: 'Ver Reporte',
  },
};
