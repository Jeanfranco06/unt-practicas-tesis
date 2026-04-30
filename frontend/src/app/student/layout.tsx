import { Metadata } from 'next';
import { StudentSidebar } from '@/components/student/StudentSidebar';
import { StudentHeader } from '@/components/student/StudentHeader';

export const metadata: Metadata = {
  title: 'Portal Estudiante - UNT',
  description: 'Portal del estudiante para gestión de prácticas y tesis',
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <StudentSidebar />
      <div className="lg:pl-72 min-h-screen flex flex-col">
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
