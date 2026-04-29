'use client';

import { DataTable } from '@/components/common/DataTable';
import { trpc } from '@/lib/trpc/react';

const columns = [
  { key: 'codigoUniversitario', header: 'Código' },
  { key: 'usuario.nombre', header: 'Nombre' },
  { key: 'usuario.apellidoPaterno', header: 'Apellido Paterno' },
  { key: 'escuelaProfesional', header: 'Escuela' },
  { key: 'promedioGeneral', header: 'Promedio' },
];

export default function StudentsPage() {
  const { data: students } = trpc.students.list.useQuery();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Estudiantes</h1>
      <DataTable data={students || []} columns={columns} />
    </div>
  );
}