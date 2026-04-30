'use client';

import { useState, useEffect } from 'react';
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
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth, UserRole } from '@/hooks/useAuth';

// Define navigation items by role
const navItemsByRole: Record<UserRole, { href: string; label: string; icon: any }[]> = {
  Administrador: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/internships', label: 'Prácticas', icon: Briefcase },
    { href: '/dashboard/thesis', label: 'Tesis', icon: BookOpen },
    { href: '/dashboard/students', label: 'Estudiantes', icon: Users },
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
  Estudiante: [], // Estudiantes usan el StudentSidebar
};

const secondaryNav = [
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { role, logout } = useAuth();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Listen for mobile menu toggle
  useEffect(() => {
    const handleToggle = () => setMobileOpen(prev => !prev);
    window.addEventListener('toggleMobileMenu', handleToggle);
    return () => window.removeEventListener('toggleMobileMenu', handleToggle);
  }, []);

  // Get navigation items based on role
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
        initial={{ x: isMobile ? -288 : 0 }}
        animate={{
          x: isMobile ? (mobileOpen ? 0 : -288) : 0,
          width: collapsed ? 80 : 288
        }}
        className={cn(
          'fixed left-0 top-0 bottom-0 z-40',
          'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900',
          'flex flex-col transition-all duration-300'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileOpen(false)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden flex-1 justify-center lg:justify-start">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
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
                  className="font-bold text-white text-lg whitespace-nowrap"
                >
                  {role === 'Administrador' ? 'UNT Admin' : 'UNT Sistema'}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            // Dashboard is only active on exact match, other items are active on exact or subroutes
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  'hover:bg-slate-700/50 group relative',
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30'
                    : 'text-slate-300 hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
                  )}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeNavAdmin"
                    className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-700/50">
            {secondaryNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    'hover:bg-slate-700/50 group',
                    isActive ? 'bg-slate-700/50 text-white' : 'text-slate-400 hover:text-slate-300'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-slate-300" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
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

        {/* Collapse Button & Logout */}
        <div className="p-3 border-t border-slate-700/50 space-y-2">
          <Button
            variant="ghost"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full justify-center text-slate-400 hover:text-white hover:bg-slate-700/50"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 mr-2" />
                <span className="text-sm">Colapsar</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
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

// Mobile menu button for admin
export function AdminMobileMenuButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="lg:hidden text-slate-400 hover:text-white"
    >
      {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </Button>
  );
}
