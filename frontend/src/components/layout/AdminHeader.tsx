'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

export function AdminHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { role, user } = useAuth();

  const roleLabels: Record<string, string> = {
    Administrador: 'Administrador',
    Coordinador: 'Coordinador',
    Asesor: 'Asesor',
    Representante_Empresa: 'Representante',
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="h-16 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setMobileMenuOpen(!mobileMenuOpen);
            window.dispatchEvent(new CustomEvent('toggleMobileMenu'));
          }}
          className="lg:hidden p-2 h-10 w-10 text-slate-400 hover:text-white hover:bg-slate-700/50"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Search */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-10 bg-slate-800/50 border-slate-700 rounded-xl h-10 w-full text-slate-200 placeholder:text-slate-500 focus:bg-slate-800 focus:border-slate-600"
            />
          </div>
        </div>

        {/* Mobile: Just show search icon */}
        <div className="flex-1 sm:hidden">
          <Button variant="ghost" size="sm" className="p-2 text-slate-400 hover:text-white">
            <Search className="w-5 h-5" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-xl hover:bg-slate-700/50 transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900" />
          </motion.button>

          {/* Profile */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-slate-700/50"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-200">{user?.email?.split('@')[0] || 'Usuario'}</p>
              <p className="text-xs text-slate-500">{role ? roleLabels[role] || role : ''}</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
