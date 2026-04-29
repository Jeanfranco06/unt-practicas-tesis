'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  Users,
  Building2,
  FileText,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/internships', label: 'Prácticas', icon: Briefcase },
  { href: '/dashboard/thesis', label: 'Tesis', icon: BookOpen },
  { href: '/dashboard/students', label: 'Estudiantes', icon: Users },
  { href: '/dashboard/companies', label: 'Empresas', icon: Building2 },
  { href: '/dashboard/reports', label: 'Reportes', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      <div className="p-4 font-bold text-xl border-b">UNT Sistema</div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn('w-full justify-start gap-2', pathname === item.href && 'bg-gray-100')}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start gap-2 text-red-600" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}