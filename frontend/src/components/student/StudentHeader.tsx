'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Menu, X, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/components/layout/SidebarContext';
import { NotificationDropdown } from './NotificationDropdown';

export function StudentHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { collapsed, toggleCollapsed } = useSidebar();
  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';
  const userName = user?.email?.split('@')[0] || 'Usuario';

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/60">
      <div className="h-16 px-3 sm:px-4 lg:px-6 flex items-center gap-2 sm:gap-3">
        {/* Mobile hamburger — only on small screens */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setMobileMenuOpen(!mobileMenuOpen);
            window.dispatchEvent(new CustomEvent('toggleMobileMenu'));
          }}
          className="lg:hidden p-2 h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Desktop collapse toggle — left of search, only lg+ */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className="hidden lg:flex p-2 h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          <PanelLeft
            className="w-5 h-5 transition-transform duration-300"
            style={{ transform: collapsed ? 'scaleX(-1)' : 'scaleX(1)' }}
          />
        </Button>

        {/* Search */}
        <div className="flex-1 max-w-sm hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-9 bg-muted/50 border-border h-9 w-full text-foreground placeholder:text-muted-foreground focus:bg-muted focus:border-primary/50"
            />
          </div>
        </div>
        
        {/* Mobile: Just show search icon */}
        <Button
          variant="ghost"
          size="sm"
          className="sm:hidden p-2 h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Search className="w-5 h-5" />
        </Button>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <ThemeToggle />

          {/* Notifications */}
          <NotificationDropdown />

          {/* Profile */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-border/60 ml-1"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground leading-tight">{userName}</p>
              <p className="text-xs text-muted-foreground">Estudiante</p>
            </div>
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-primary/25 flex-shrink-0">
              <span className="text-primary-foreground font-semibold text-sm">{userInitial}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
