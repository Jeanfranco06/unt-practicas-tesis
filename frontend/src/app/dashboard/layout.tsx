'use client';

import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950">
        <AdminSidebar />
        <div className="lg:pl-72 min-h-screen flex flex-col">
          <AdminHeader />
          <main className="flex-1 py-4 px-3 sm:py-5 sm:px-4 lg:py-6 lg:px-6">
            <div className="w-full max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}