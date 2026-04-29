'use client';
import { DataTable } from '@/components/common/DataTable';
import { trpc } from '@/lib/trpc/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const columns = [
  { key: 'titulo', header: 'Título' },
  { key: 'areaConocimiento', header: 'Área' },
  { key: 'estado', header: 'Estado' },
  { key: 'estudianteId', header: 'Estudiante ID' },
];

export default function ThesisListPage() {
  const { data: projects } = trpc.thesis.listProjects.useQuery();
  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Proyectos de Tesis</h1>
        <Link href="/dashboard/thesis/new">
          <Button><Plus className="mr-2 h-4 w-4" />Nuevo Proyecto</Button>
        </Link>
      </div>
      <DataTable data={projects || []} columns={columns} />
    </div>
  );
}