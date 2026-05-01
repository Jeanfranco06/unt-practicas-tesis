'use client';

import { StudentSidebar } from '@/components/student/StudentSidebar';
import { StudentHeader } from '@/components/student/StudentHeader';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { SidebarProvider, useSidebar } from '@/components/layout/SidebarContext';
import { cn } from '@/lib/utils';

function StudentLayoutInner({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <StudentSidebar />
      <div
        className={cn(
          'min-h-screen flex flex-col transition-all duration-300 ease-in-out',
          collapsed ? 'lg:pl-20' : 'lg:pl-72'
        )}
      >
        <StudentHeader />
        <main className="flex-1 py-4 px-3 sm:py-5 sm:px-4 lg:py-6 lg:px-6">
          <div className="w-full max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <StudentLayoutInner>{children}</StudentLayoutInner>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
