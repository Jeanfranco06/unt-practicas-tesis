'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function StudentHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="h-16 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setMobileMenuOpen(!mobileMenuOpen);
            // Dispatch custom event for sidebar
            window.dispatchEvent(new CustomEvent('toggleMobileMenu'));
          }}
          className="lg:hidden p-2 h-10 w-10"
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
              className="pl-10 bg-slate-50 border-slate-200 rounded-xl h-10 w-full"
            />
          </div>
        </div>
        
        {/* Mobile: Just show search icon */}
        <div className="flex-1 sm:hidden">
          <Button variant="ghost" size="sm" className="p-2">
            <Search className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </motion.button>

          {/* Profile */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-slate-200"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">Juan Pérez</p>
              <p className="text-xs text-slate-500">Estudiante</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-semibold text-sm">JP</span>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
