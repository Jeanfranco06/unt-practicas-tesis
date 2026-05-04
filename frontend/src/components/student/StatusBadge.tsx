'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-700',
        active: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
        pending: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
        completed: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
        rejected: 'bg-red-100 text-red-700 ring-1 ring-red-200',
        draft: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
      },
      size: {
        default: 'text-sm px-3 py-1',
        sm: 'text-xs px-2 py-0.5',
        lg: 'text-base px-4 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

const statusConfig = {
  active: { label: 'Activo', color: 'bg-emerald-500' },
  pending: { label: 'Pendiente', color: 'bg-amber-500' },
  completed: { label: 'Completado', color: 'bg-blue-500' },
  rejected: { label: 'Rechazado', color: 'bg-red-500' },
  draft: { label: 'Borrador', color: 'bg-slate-500' },
  default: { label: 'Default', color: 'bg-slate-500' },
};

export function StatusBadge({
  children,
  variant = 'default',
  size,
  className,
  pulse = false,
}: StatusBadgeProps) {
  const config = statusConfig[variant || 'default'] || statusConfig.default;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(badgeVariants({ variant, size }), className)}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${config.color}`}
          />
        </span>
      )}
      {!pulse && <span className={cn('w-2 h-2 rounded-full', config.color)} />}
      {children}
    </motion.span>
  );
}
