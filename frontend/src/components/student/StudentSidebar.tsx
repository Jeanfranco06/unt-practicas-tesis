'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  UserCircle,
  Settings,
  GraduationCap,
  LogOut,
  X,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/layout/SidebarContext';

const navigation = [
  { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Prácticas', href: '/student/practicas', icon: Briefcase },
  { name: 'Tesis', href: '/student/tesis', icon: BookOpen },
  { name: 'Perfil', href: '/student/perfil', icon: UserCircle },
];

const secondaryNavigation = [
  { name: 'Configuración', href: '/student/perfil', icon: Settings },
];

// Mobile menu button export
export function MobileMenuButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="lg:hidden"
    >
      {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </Button>
  );
}

export function StudentSidebar() {
  const pathname = usePathname();
  const { collapsed, mobileOpen, setMobileOpen, toggleMobileOpen } = useSidebar();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  // Listen for mobile menu toggle from header
  useEffect(() => {
    window.addEventListener('toggleMobileMenu', toggleMobileOpen);
    return () => window.removeEventListener('toggleMobileMenu', toggleMobileOpen);
  }, [toggleMobileOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: mobileOpen ? 0 : typeof window !== 'undefined' && window.innerWidth < 1024 ? -288 : 0,
          width: collapsed ? 80 : 288,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 bottom-0 z-40 flex flex-col',
          'bg-sidebar border-r border-sidebar-border shadow-elevated',
          !mobileOpen && '-translate-x-full lg:translate-x-0'
        )}
        style={{ width: collapsed ? 80 : 288 }}
      >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border/60">
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileOpen(false)}
            className="p-1"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <Link href="/student/dashboard" className="flex items-center gap-3 overflow-hidden flex-1 justify-center lg:justify-start">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-sidebar-foreground text-lg whitespace-nowrap overflow-hidden"
              >
                UNT Estudiante
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                'hover:bg-sidebar-accent group relative',
                isActive
                  ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 flex-shrink-0 transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70'
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && !collapsed && (
                <motion.div
                  layoutId="activeNavStudent"
                  className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-sidebar-border/50">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  'hover:bg-sidebar-accent group',
                  collapsed && 'justify-center',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0 text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout only */}
      <div className="p-3 border-t border-sidebar-border/50">
        <Button
          variant="ghost"
          onClick={() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            window.location.href = '/login';
          }}
          className="w-full text-red-500 hover:text-red-600 hover:bg-red-500/10"
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="ml-2 text-sm"
              >
                Cerrar sesión
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.aside>
    </>
  );
}
