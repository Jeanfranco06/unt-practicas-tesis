'use client';

import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { CoordinatorSidebar } from '@/components/layout/CoordinatorSidebar';
import { CompanySidebar } from '@/components/layout/CompanySidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { SidebarProvider, useSidebar } from '@/components/layout/SidebarContext';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const { role, isLoading } = useAuth();

  // Elegir sidebar según el rol
  const renderSidebar = () => {
    if (role === 'Coordinador') {
      return <CoordinatorSidebar />;
    }
    if (role === 'RepresentanteEmpresa') {
      return <CompanySidebar />;
    }
    return <AdminSidebar />;
  };

  // Mostrar estado de carga mientras se determina el rol
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {renderSidebar()}
      <div
        className={cn(
          'min-h-screen flex flex-col transition-all duration-300 ease-in-out',
          collapsed ? 'lg:pl-20' : 'lg:pl-72'
        )}
      >
        <AdminHeader />
        <main className="flex-1 py-4 px-3 sm:py-5 sm:px-4 lg:py-6 lg:px-6">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <DashboardInner>{children}</DashboardInner>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
