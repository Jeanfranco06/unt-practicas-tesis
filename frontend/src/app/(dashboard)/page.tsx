'use client';

import { StatCard } from '@/components/common/StatCard';
import { InternshipChart } from '@/components/charts/InternshipChart';
import { ThesisChart } from '@/components/charts/ThesisChart';
import { trpc } from '@/lib/trpc/react';
import { Loader } from '@/components/common/Loader';

export default function DashboardPage() {
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Prácticas Activas" value={stats?.activeInternships || 0} icon="briefcase" />
        <StatCard title="Tesis en Curso" value={stats?.activeThesis || 0} icon="book" />
        <StatCard title="Convenios Vigentes" value={stats?.activeAgreements || 0} icon="file" />
        <StatCard title="Estudiantes Registrados" value={stats?.totalStudents || 0} icon="users" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InternshipChart data={stats?.internshipByMonth} />
        <ThesisChart data={stats?.thesisByArea} />
      </div>
    </div>
  );
}