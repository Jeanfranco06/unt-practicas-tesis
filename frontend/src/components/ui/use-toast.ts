import React from 'react';
import { createRoot } from 'react-dom/client';

type ToastVariant = 'default' | 'destructive';

interface ToastOptions {
  title?: string;
  description?: string | React.ReactNode;
  variant?: ToastVariant;
}

function ensureToastContainer() {
  let container = document.getElementById('app-toast-container');

  if (!container) {
    container = document.createElement('div');
    container.id = 'app-toast-container';
    container.className = 'fixed right-4 top-4 z-[9999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3';
    document.body.appendChild(container);
  }

  return container;
}

export function useToast() {
  return {
    toast: ({ title, description, variant = 'default' }: ToastOptions) => {
      if (typeof window === 'undefined') return;

      const container = ensureToastContainer();
      const toast = document.createElement('div');
      const isDestructive = variant === 'destructive';

      toast.className = [
        'rounded-xl border px-4 py-3 shadow-lg transition-all duration-300',
        'bg-slate-950 text-slate-100',
        isDestructive ? 'border-red-500/40' : 'border-emerald-500/40',
      ].join(' ');

      // Create title element
      const titleDiv = document.createElement('div');
      titleDiv.className = 'text-sm font-semibold';
      titleDiv.textContent = title || (isDestructive ? 'Error' : 'Operación exitosa');
      toast.appendChild(titleDiv);

      // Create description element
      if (description) {
        const descDiv = document.createElement('div');
        descDiv.className = 'mt-1 text-sm text-slate-300';

        if (typeof description === 'string') {
          descDiv.textContent = description;
        } else {
          // Render React node
          const root = createRoot(descDiv);
          root.render(description as React.ReactElement);
        }

        toast.appendChild(descDiv);
      }

      container.appendChild(toast);

      window.setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-4');
        window.setTimeout(() => toast.remove(), 300);
      }, 3500);
    },
  };
}
