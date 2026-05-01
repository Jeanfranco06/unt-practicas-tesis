'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  Users,
  Building2,
  FileText,
  LogOut,
  GraduationCap,
  Shield,
  X,
  Settings,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { useSidebar } from '@/components/layout/SidebarContext';

const navItemsByRole: Record<UserRole, { href: string; label: string; icon: any }[]> = {
  Administrador: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/users', label: 'Usuarios', icon: Users },
    { href: '/dashboard/internships', label: 'Prácticas', icon: Briefcase },
    { href: '/dashboard/thesis', label: 'Tesis', icon: BookOpen },
    { href: '/dashboard/students', label: 'Estudiantes', icon: GraduationCap },
    { href: '/dashboard/companies', label: 'Empresas', icon: Building2 },
    { href: '/dashboard/reports', label: 'Reportes', icon: FileText },
  ],
  Coordinador: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/internships', label: 'Prácticas', icon: Briefcase },
    { href: '/dashboard/thesis', label: 'Tesis', icon: BookOpen },
    { href: '/dashboard/students', label: 'Estudiantes', icon: Users },
    { href: '/dashboard/companies', label: 'Empresas', icon: Building2 },
    { href: '/dashboard/reports', label: 'Reportes', icon: FileText },
  ],
  Asesor: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/internships', label: 'Prácticas', icon: Briefcase },
    { href: '/dashboard/thesis', label: 'Tesis', icon: BookOpen },
    { href: '/dashboard/students', label: 'Estudiantes', icon: Users },
  ],
  Representante_Empresa: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/internships', label: 'Prácticas', icon: Briefcase },
    { href: '/dashboard/companies', label: 'Mi Empresa', icon: Building2 },
  ],
  Estudiante: [],
};

const secondaryNav = [
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { role, logout } = useAuth();
  const { collapsed, mobileOpen, setMobileOpen, toggleMobileOpen } = useSidebar();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  useEffect(() => {
    window.addEventListener('toggleMobileMenu', toggleMobileOpen);
    return () => window.removeEventListener('toggleMobileMenu', toggleMobileOpen);
  }, [toggleMobileOpen]);

  const navItems = role ? navItemsByRole[role] || [] : [];

  if (!role || role === 'Estudiante') return null;

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
          // On mobile, start hidden off-screen
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
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 overflow-hidden flex-1 justify-center lg:justify-start"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/25">
              {role === 'Administrador' ? (
                <Shield className="w-6 h-6 text-white" />
              ) : (
                <GraduationCap className="w-6 h-6 text-white" />
              )}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-sidebar-foreground text-lg whitespace-nowrap overflow-hidden"
                >
                  {role === 'Administrador' ? 'UNT Admin' : 'UNT Sistema'}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  'hover:bg-sidebar-accent group relative',
                  collapsed && 'justify-center',
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
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="activeNavAdmin"
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
            {secondaryNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
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
                        {item.label}
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
            onClick={logout}
            title={collapsed ? 'Cerrar sesión' : undefined}
            className={cn(
              'w-full text-red-500 hover:text-red-600 hover:bg-red-500/10',
              collapsed ? 'justify-center px-0' : 'justify-start'
            )}
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
